export class IntentNotFoundError extends Error {
  constructor(intentId: string) {
    super(`Payment intent not found: ${intentId}`);
    this.name = "IntentNotFoundError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export class ChainNotSupportedError extends Error {
  constructor(chainId: number) {
    super(`Chain not supported: ${chainId}`);
    this.name = "ChainNotSupportedError";
  }
}
