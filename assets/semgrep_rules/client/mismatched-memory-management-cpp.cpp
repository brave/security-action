void RedeemOptedOutConfirmation::Destroy() {
  // ok: raptor-mismatched-memory-management-cpp
  delete this;
}