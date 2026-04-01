/**
 * ARVI × Hypercerts Integration
 * Auto-mints a hypercert claim after each completed monitoring cycle.
 *
 * Uses @hypercerts-org/sdk on Base Sepolia (testnet).
 * Operator private key provided via HYPERCERTS_OPERATOR_PRIVATE_KEY env var.
 *
 * PL_Genesis tracks: Hypercerts ($2,500), EF Agent Only ($4,000)
 */

import { HypercertsClient } from "@hypercerts-org/sdk";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export interface ARVICycleResult {
  nodeId: string;
  location: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  anomalyDetected: boolean;
  riskCategory: string;
  summary: string;
  r2LogUrl: string;
  onchainTxHash?: string;
}

export interface HypercertMintResult {
  success: boolean;
  claimId?: string;
  txHash?: string;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

/**
 * Build Hypercert metadata from an ARVI monitoring cycle.
 * Maps ARVI outputs to the HypercertMetadata schema.
 */
function buildHypercertMetadata(cycle: ARVICycleResult) {
  const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
  const units = BigInt(severityWeight[cycle.severity] ?? 1);

  return {
    name: `ARVI Environmental Monitor — ${cycle.location}`,
    description: [
      `Autonomous environmental monitoring cycle completed by ARVI agent (agentId: 33311, ERC-8004 registered on Base Mainnet).`,
      ``,
      `Location: ${cycle.location}`,
      `Timestamp: ${cycle.timestamp}`,
      `Severity: ${cycle.severity.toUpperCase()}`,
      `Anomaly detected: ${cycle.anomalyDetected}`,
      `Risk category: ${cycle.riskCategory}`,
      ``,
      `AI Analysis (Venice AI, llama-3.3-70b, zero retention):`,
      cycle.summary,
      ``,
      `Evidence:`,
      `• Immutable alert log: ${cycle.r2LogUrl}`,
      cycle.onchainTxHash
        ? `• On-chain event (Base Mainnet): https://basescan.org/tx/${cycle.onchainTxHash}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    image: "ipfs://bafkreihlmqrpjfvgkzkouyohwcqn5t2rqsyg7ctzikjphzyjmygbxhgvdi",
    external_url: `https://arvi-eight.vercel.app`,
    properties: [
      { trait_type: "Agent ID", value: "33311" },
      { trait_type: "Operator", value: "0x7B0bdef5d73f68972EA52499f48d3Eef36CDb9aD" },
      { trait_type: "ERC-8004 Registered", value: "true" },
      { trait_type: "Location", value: cycle.location },
      { trait_type: "Severity", value: cycle.severity },
      { trait_type: "Risk Category", value: cycle.riskCategory },
      { trait_type: "Inference Model", value: "venice-llama-3.3-70b" },
      { trait_type: "Simulated", value: "false" },
      { trait_type: "R2 Log", value: cycle.r2LogUrl },
    ],
  };
}

/**
 * Mint a Hypercert for a completed ARVI monitoring cycle.
 *
 * Only mints when:
 * - anomaly_detected = true (there's something worth attesting)
 * - HYPERCERTS_OPERATOR_PRIVATE_KEY is set
 *
 * On success: returns claimId + txHash
 * On skip/failure: returns skipped=true or error message — never throws
 */
export async function mintCycleHypercert(
  cycle: ARVICycleResult
): Promise<HypercertMintResult> {
  // Guardrail: only mint when there's a real anomaly to attest
  if (!cycle.anomalyDetected) {
    return {
      success: false,
      skipped: true,
      reason: "No anomaly detected — hypercert skipped (nothing to attest)",
    };
  }

  const privateKey = process.env.HYPERCERTS_OPERATOR_PRIVATE_KEY;
  if (!privateKey) {
    return {
      success: false,
      skipped: true,
      reason: "HYPERCERTS_OPERATOR_PRIVATE_KEY not set — hypercert skipped",
    };
  }

  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const client = new HypercertsClient({
      chain: baseSepolia,
      walletClient,
      publicClient,
    });

    const metadata = buildHypercertMetadata(cycle);

    // Mint the hypercert — 1 fraction per severity unit
    const severityUnits = {
      low: BigInt(1),
      medium: BigInt(2),
      high: BigInt(3),
      critical: BigInt(4),
    };

    const tx = await client.mintHypercert({
      metaData: metadata,
      totalUnits: severityUnits[cycle.severity] ?? BigInt(1),
      transferRestriction: 0, // AllowAll
    });

    console.log(`[ARVI Hypercert] Minted — tx: ${tx}`);

    return {
      success: true,
      txHash: tx as string,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ARVI Hypercert] Mint failed: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}
