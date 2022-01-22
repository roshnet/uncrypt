import { Box } from '@strapi/design-system/Box'
import { Button } from '@strapi/design-system/Button'
import { Checkbox } from '@strapi/design-system/Checkbox'
import { Divider } from '@strapi/design-system/Divider'
import { Flex } from '@strapi/design-system/Flex'
import { GridLayout } from '@strapi/design-system/Layout'
import { Typography } from '@strapi/design-system/Typography'
import { Lock, Plus } from '@strapi/icons'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useState } from 'react'
import FileListItem from '../components/FileListItem'

export default function EncryptScreen() {
  const [files, setFiles] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean>(true)

  async function selectFiles() {
    const filePaths = await ipcRenderer.invoke('OPEN_FILE_SELECT')
    setFiles(filePaths)
  }

  const EncryptionFlow = () => (
    <Box padding={5}>
      <GridLayout className="file-viewer">
        {files.map((filepath) => (
          <Box padding={2} background="neutral100" key={filepath}>
            <FileListItem title={path.basename(filepath)} tooltip={filepath} />
            <Divider />
          </Box>
        ))}
      </GridLayout>
      <Box padding={8} className="u-center">
        <Checkbox
          onChange={() => setChecked(!checked)}
          hint="If checked, copies of original files will be encrypted. Original files will stay unaffected."
          checked={checked}
        >
          Preserve original files
        </Checkbox>
      </Box>
      <Box>
        <Button startIcon={<Lock />} size="L" variant="primary" fullWidth>
          ENCRYPT
        </Button>
      </Box>
    </Box>
  )

  return (
    <Flex justifyContent="center" alignItems="center">
      <Box padding={10}>
        <Box padding={4} className="u-center">
          <Button
            onClick={selectFiles}
            endIcon={<Plus />}
            variant="secondary"
            size="L"
          >
            Add Files
          </Button>
        </Box>
        <Box className="u-center">
          {files.length ? (
            <EncryptionFlow />
          ) : (
            <Typography variant="pi">
              Pick a few files to get started.
            </Typography>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
