import { ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { player, level, gameState } = req.body;

    if (!ethers.isAddress(player)) return res.status(400).json({ error: "Invalid player address" });
    if (typeof level !== "number" || level < 0 || level > 4) return res.status(400).json({ error: "Invalid level" });
    if (!gameState || !gameState.won) return res.status(400).json({ error: "Game not won" });
    if (gameState.moves < 8) return res.status(400).json({ error: "Suspicious game (too short)" });

    const CHESS = "0x3b3933432baC6E98F2DcCF5e372569644703Fe05";
    const CHAIN_ID = 56;
    const nonce = Date.now();

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint8", "uint256", "address", "uint256"],
      [player, level, nonce, CHESS, CHAIN_ID]
    );

    const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);
    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    return res.status(200).json({ signature, nonce, level, player });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Signing failed" });
  }
}
