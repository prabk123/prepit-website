// Unit tests for the withdraw-from-contract wording (PRE-360). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { WITHDRAWAL_PATH, withdrawalLinkLabel, withdrawalWording } from "../src/lib/contractWithdrawal.ts";

test("Ireland says cancel contract, everywhere else withdraw from contract", () => {
  assert.equal(withdrawalLinkLabel("IE"), "Cancel contract here");
  assert.equal(withdrawalLinkLabel("ie"), "Cancel contract here");
  assert.equal(withdrawalLinkLabel("DE"), "Withdraw from contract here");
  assert.equal(withdrawalLinkLabel("GB"), "Withdraw from contract here");
  assert.equal(withdrawalLinkLabel(null), "Withdraw from contract here");
});

test("the page and confirm step follow the link's wording", () => {
  assert.equal(withdrawalWording("IE").confirm, "Confirm cancellation");
  assert.equal(withdrawalWording("FR").confirm, "Confirm withdrawal");
  assert.equal(WITHDRAWAL_PATH, "/withdraw");
});
