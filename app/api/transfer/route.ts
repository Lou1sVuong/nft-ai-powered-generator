import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
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
    console.log("Received transfer request");
    
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
      from: body.from,
      to: body.to,
      amount: body.amount,
      hasSignature: !!body.signature
    });

    const { from, to, amount, signature } = body;

    // Validate required fields
    if (!from || !to || !amount || !signature) {
      console.error("Missing required fields:", { 
        from: !!from, 
        to: !!to, 
        amount: !!amount,
        signature: !!signature 
      });
      return NextResponse.json(
        { error: "Missing required fields", details: "From, to, amount, and signature are required" },
        { status: 400 }
      );
    }

    // Validate public keys
    let fromPubkey: PublicKey;
    let toPubkey: PublicKey;
    try {
      fromPubkey = new PublicKey(from);
      toPubkey = new PublicKey(to);
    } catch (error) {
      console.error("Invalid public key:", error);
      return NextResponse.json(
        { error: "Invalid public key format" },
        { status: 400 }
      );
    }

    try {
      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: toPubkey,
          lamports: amount * 1e9, // Convert SOL to lamports
        })
      );

      // Set recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Add signature
      transaction.addSignature(fromPubkey, Buffer.from(signature));

      // Send transaction
      const txid = await connection.sendRawTransaction(transaction.serialize());
      console.log("Transaction sent:", txid);

      // Confirm transaction
      const confirmation = await connection.confirmTransaction(txid);
      console.log("Transaction confirmed:", confirmation);

      return NextResponse.json({
        success: true,
        txid,
      });
    } catch (error) {
      console.error("Error during transfer:", error);
      
      // Get detailed transaction logs if available
      if (error instanceof Error && 'logs' in error) {
        console.error("Transaction logs:", (error as any).logs);
      }
      
      throw new Error(`Failed to transfer tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Detailed error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to transfer tokens",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
} 