import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Metaplex, keypairIdentity, toMetaplexFile } from "@metaplex-foundation/js";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import nacl from "tweetnacl";

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
  
  // Warn if balance is too low
  if (balance < 0.05 * 1e9) { // Less than 0.05 SOL
    console.warn("⚠️ WARNING: Server wallet balance is very low. Please fund this wallet address to mint NFTs.");
    if (balance === 0) {
      console.error("❌ ERROR: Server wallet has zero balance. NFT minting will fail!");
      console.error("👉 PLEASE FUND THIS ADDRESS: " + serverKeypair.publicKey.toBase58());
    }
  }
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
      hasMessage: !!body.message,
      skipSignatureVerification: !!body.skipSignatureVerification,
      description: body.description 
    });

    const { image, title, description, publicKey, signature, message, skipSignatureVerification } = body;

    // Validate required fields
    if (!image || !title || !publicKey) {
      console.error("Missing required fields:", { 
        image: !!image, 
        title: !!title, 
        publicKey: !!publicKey,
      });
      return NextResponse.json(
        { error: "Missing required fields", details: "Image, title, and publicKey are required" },
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

    // Verify the signature if not skipping verification
    if (!skipSignatureVerification) {
      if (!signature || !message) {
        console.error("Missing signature or message");
        return NextResponse.json(
          { error: "Missing required fields", details: "Signature and message are required when not skipping verification" },
          { status: 400 }
        );
      }
      
      try {
        console.log("Verifying signature...");
        const messageBuffer = Buffer.from(message);
        const signatureBuffer = Buffer.from(signature, 'base64');
        
        // Use tweetnacl to verify the signature
        console.log("Using nacl for verification");
        const isValid = nacl.sign.detached.verify(
          messageBuffer, 
          signatureBuffer,
          creatorPublicKey.toBytes()
        );
        
        if (!isValid) {
          console.error("Signature verification failed");
          return NextResponse.json(
            { error: "Invalid signature", details: "The provided signature could not be verified" },
            { status: 400 }
          );
        }
        
        console.log("Signature verified successfully");
      } catch (error) {
        console.error("Error verifying signature:", error);
        return NextResponse.json(
          { error: "Signature verification failed", details: error instanceof Error ? error.message : "Unknown error" },
          { status: 400 }
        );
      }
    } else {
      console.log("Skipping signature verification as requested");
    }

    try {
      // First, upload the image to Arweave
      console.log("Uploading image to Arweave...");
      
      // Check balance again before proceeding
      const balance = await connection.getBalance(serverKeypair.publicKey);
      if (balance === 0) {
        return NextResponse.json(
          { 
            error: "Server wallet has no funds", 
            details: "Please fund the server wallet address: " + serverKeypair.publicKey.toBase58()
          },
          { status: 400 }
        );
      }
      
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