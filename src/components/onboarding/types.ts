import type { useOnboarding } from "@/hooks/useOnboarding"

// We use ReturnType to infer the types directly from the hook
// This ensures the "skin" components are always in sync with the "brain"
type OnboardingHook = ReturnType<typeof useOnboarding>

// We only need a subset of the hook's return values for the step components
export type OnboardingStepProps = Pick<
  OnboardingHook,
  "formData" | "handleChange" | "handleMultiSelectChange" | "serviceOptions" | "areaOptions"
>
