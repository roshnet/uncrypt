import { Box } from '@strapi/design-system/Box'
import { Button } from '@strapi/design-system/Button'
import { Divider } from '@strapi/design-system/Divider'
import { Flex } from '@strapi/design-system/Flex'
import { GridLayout } from '@strapi/design-system/Layout'
import { Typography } from '@strapi/design-system/Typography'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useState } from 'react'
import FileListItem from '../components/FileListItem'

export default function EncryptScreen() {
  const [files, setFiles] = useState<string[]>([])

  async function selectFiles() {
    const filePaths = await ipcRenderer.invoke('OPEN_FILE_SELECT')
    setFiles(filePaths)
  }

  const EncryptionFlow = () => (
    <GridLayout className="file-viewer">
      {files.map((filepath) => (
        <Box padding={2} hasRadius background="neutral0" key={filepath}>
          <FileListItem title={path.basename(filepath)} tooltip={filepath} />
          <Divider />
        </Box>
      ))}
    </GridLayout>
  )

  return (
    <Flex justifyContent="center" alignItems="center">
      <Box padding={10}>
        <Box padding={4} className="u-center">
          <Button onClick={selectFiles}>Add Files</Button>
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
