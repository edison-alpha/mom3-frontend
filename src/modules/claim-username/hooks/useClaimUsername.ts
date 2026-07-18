"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimUsername } from "../utils/username.api";
import type { ClaimUsernameInput, UsernameIdentity } from "../types/claim-username.types";

export function useClaimUsername() {
  const queryClient = useQueryClient();
  return useMutation<UsernameIdentity, Error, ClaimUsernameInput>({
    mutationKey: ["username", "claim"],
    mutationFn: claimUsername,
    onSuccess: (identity, input) => {
      queryClient.setQueryData(["username", "owner", input.ownerAddress], identity);
    },
  });
}
