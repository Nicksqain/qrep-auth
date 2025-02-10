import { Box, Field, Input, defineStyle, type InputProps } from "@chakra-ui/react"
import { forwardRef } from "react"

export const FloatingInput = forwardRef<HTMLInputElement, InputProps & { label: string }>(
  ({ label, ...props }, ref) => {
    return (
      <Field.Root>
        <Box pos="relative" w="full">
          <Input ref={ref} className="peer" placeholder="" {...props} />
          <Field.Label css={floatingStyles}>{label}</Field.Label>
        </Box>
      </Field.Root>
    )
  }
)

const floatingStyles = defineStyle({
  pos: "absolute",
  bg: "bg",
  px: "0.5",
  top: "-3",
  insetStart: "0",
  fontWeight: "normal",
  pointerEvents: "none",
  transition: "position",
  _peerPlaceholderShown: {
    color: "fg.muted",
    top: "2.5",
    insetStart: "2",
  },
  _peerFocusVisible: {
    color: "fg",
    top: "-3",
    insetStart: "0",
  },
})

FloatingInput.displayName = "FloatingInput"
