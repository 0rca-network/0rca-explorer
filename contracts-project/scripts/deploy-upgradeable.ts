import { ethers } from "ethers";
import * as hre from "hardhat";

async function main() {
  console.log("Deploying ERC-8004 Upgradeable Contracts (Standalone Ethers ESM)");
  console.log("==============================================================");

  // console.log("HRE Keys:", Object.keys(hre));
  // Check if hre has network or if it is on default
  const hh = (hre as any).default || hre;

  const url = (hh.network && hh.network.config && hh.network.config.url) || "https://evm-t3.cronos.org";
  // Fallback mnemonic
  const mnemonic = "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle";

  const provider = new ethers.JsonRpcProvider(url);
  const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

  console.log("Deployer address:", wallet.address);

  async function deploy(name: string, args: any[] = []) {
    console.log(`Deploying ${name}...`);
    const artifact = await hre.artifacts.readArtifact(name);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    console.log(`   ${name} deployed at:`, contract.target);
    return contract;
  }

  // 1. IdentityRegistry
  console.log("1. Setup IdentityRegistry");
  const identityImpl = await deploy("IdentityRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const IdentityArtifact = await hre.artifacts.readArtifact("IdentityRegistryUpgradeable");
  const IdentityInterface = new ethers.Interface(IdentityArtifact.abi);
  const identityInitData = IdentityInterface.encodeFunctionData("initialize", []);

  const identityProxy = await deploy("ERC1967Proxy", [identityImpl.target, identityInitData]);

  // 2. ReputationRegistry
  console.log("2. Setup ReputationRegistry");
  const reputationImpl = await deploy("ReputationRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const ReputationArtifact = await hre.artifacts.readArtifact("ReputationRegistryUpgradeable");
  const ReputationInterface = new ethers.Interface(ReputationArtifact.abi);
  const reputationInitData = ReputationInterface.encodeFunctionData("initialize", [identityProxy.target]);

  const reputationProxy = await deploy("ERC1967Proxy", [reputationImpl.target, reputationInitData]);

  // 3. ValidationRegistry
  console.log("3. Setup ValidationRegistry");
  const validationImpl = await deploy("ValidationRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const ValidationArtifact = await hre.artifacts.readArtifact("ValidationRegistryUpgradeable");
  const ValidationInterface = new ethers.Interface(ValidationArtifact.abi);
  const validationInitData = ValidationInterface.encodeFunctionData("initialize", [identityProxy.target]);

  const validationProxy = await deploy("ERC1967Proxy", [validationImpl.target, validationInitData]);

  console.log("");
  console.log("Deployment Summary");
  console.log("==================");
  console.log("IdentityRegistry Proxy:", identityProxy.target);
  console.log("ReputationRegistry Proxy:", reputationProxy.target);
  console.log("ValidationRegistry Proxy:", validationProxy.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
