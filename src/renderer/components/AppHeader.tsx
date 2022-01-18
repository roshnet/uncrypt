import { Box } from '@strapi/design-system/Box'
import { HeaderLayout } from '@strapi/design-system/Layout'

export default function AppHeader() {
  return (
    <Box>
      <HeaderLayout
        title="uCrypt"
        subtitle="Secure your files without leaving your device."
      />
    </Box>
  )
}
