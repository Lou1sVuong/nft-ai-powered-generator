import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Metaplex, keypairIdentity, toMetaplexFile } from "@metaplex-foundation/js";
import { Keypair } from "@solana/web3.js";

// Initialize connection to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a new keypair for the server
const serverKeypair = Keypair.generate();

// Initialize Metaplex with error handling
let metaplex: Metaplex;
try {
  console.log("Initializing Metaplex...");
  metaplex = Metaplex.make(connection)
    .use(keypairIdentity(serverKeypair));
  console.log("Metaplex initialized successfully");
  console.log("Server public key (fund this address on devnet):", serverKeypair.publicKey.toBase58());
  
  // Check server account balance
  const balance = await connection.getBalance(serverKeypair.publicKey);
  console.log("Server account balance:", balance / 1e9, "SOL");
} catch (error) {
  console.error("Failed to initialize Metaplex:", error);
  throw new Error("Failed to initialize Metaplex");
}

export async function POST(request: Request) {
  try {
    console.log("Received mint request");
    
    // Validate request body
    if (!request.body) {
      console.error("No request body provided");
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Request body:", { 
      hasImage: !!body.image, 
      title: body.title,
      hasPublicKey: !!body.publicKey,
      hasSignature: !!body.signature,
      description: body.description 
    });

    const { image, title, description, publicKey, signature } = body;

    // Validate required fields
    if (!image || !title || !publicKey || !signature) {
      console.error("Missing required fields:", { 
        image: !!image, 
        title: !!title, 
        publicKey: !!publicKey,
        signature: !!signature 
      });
      return NextResponse.json(
        { error: "Missing required fields", details: "Image, title, publicKey, and signature are required" },
        { status: 400 }
      );
    }

    // Validate public key format
    let creatorPublicKey: PublicKey;
    try {
      console.log("Validating public key:", publicKey);
      // Clean the public key string by removing any whitespace or special characters
      const cleanPublicKey = publicKey.trim();
      creatorPublicKey = new PublicKey(cleanPublicKey);
      console.log("Public key is valid:", creatorPublicKey.toBase58());
    } catch (error) {
      console.error("Invalid public key:", error);
      return NextResponse.json(
        { 
          error: "Invalid public key", 
          details: "The provided public key is not in a valid format",
          receivedKey: publicKey,
          cleanKey: publicKey.trim()
        },
        { status: 400 }
      );
    }

    try {
      // First, upload the image to Arweave
      console.log("Uploading image to Arweave...");
      const imageFile = toMetaplexFile(
        Buffer.from(image.split(',')[1], 'base64'),
        `${title.replace(/\s+/g, '-').toLowerCase()}.png`
      );
      const imageUploadResult = await metaplex.storage().upload(imageFile);
      console.log("Image uploaded successfully:", imageUploadResult);

      // Create metadata with Arweave URI
      const metadata = {
        name: title,
        symbol: "ART",
        description: description || "",
        image: imageUploadResult,
        attributes: [],
        properties: {
          files: [
            {
              uri: imageUploadResult,
              type: "image/png",
            },
          ],
        },
      };

      // Upload metadata to Arweave
      console.log("Uploading metadata to Arweave...");
      const metadataFile = toMetaplexFile(
        Buffer.from(JSON.stringify(metadata)),
        `${title.replace(/\s+/g, '-').toLowerCase()}.json`
      );
      const metadataUploadResult = await metaplex.storage().upload(metadataFile);
      console.log("Metadata uploaded successfully:", metadataUploadResult);

      // Create NFT with Arweave URI
      console.log("Creating NFT transaction...");
      const { nft } = await metaplex.nfts().create({
        uri: metadataUploadResult,
        name: title,
        sellerFeeBasisPoints: 500, // 5% royalty
        symbol: "ART",
        creators: [
          {
            address: creatorPublicKey,
            share: 100,
          },
        ],
      });

      console.log("NFT minted successfully:", nft.address.toBase58());

      return NextResponse.json({
        success: true,
        nftAddress: nft.address.toBase58(),
      });
    } catch (error) {
      console.error("Error during NFT minting:", error);
      
      // Get detailed transaction logs if available
      if (error instanceof Error && 'logs' in error) {
        console.error("Transaction logs:", (error as any).logs);
      }
      
      throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Detailed error:", error);
    
    // Ensure we return a proper JSON response even for errors
    return NextResponse.json(
      { 
        error: "Failed to mint NFT",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 