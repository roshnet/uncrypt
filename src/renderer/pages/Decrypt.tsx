import { Box } from '@strapi/design-system/Box'
import { Button } from '@strapi/design-system/Button'
import { Divider } from '@strapi/design-system/Divider'
import { Flex } from '@strapi/design-system/Flex'
import { GridLayout } from '@strapi/design-system/Layout'
import { Loader } from '@strapi/design-system/Loader'
import { Typography } from '@strapi/design-system/Typography'
import { Lock, Plus } from '@strapi/icons'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import FileListItem from '../components/FileListItem'

export default function DecryptScreen() {
  const [files, setFiles] = useState<string[]>([])
  const [inProgress, setInProgress] = useState<boolean>(false)
  const results: boolean[] = []

  async function selectFiles() {
    const filePaths = await ipcRenderer.invoke('OPEN_FILE_SELECT')
    setFiles(filePaths)
  }

  const resetLocalState = () => {
    setFiles([])
    setInProgress(false)
    results.length = 0
  }

  async function beginDecryption() {
    setInProgress(true)
    for (const fp of files) {
      const res = (await ipcRenderer.invoke('DECRYPT', fp)) as boolean
      results.push(res)
    }
    setInProgress(false)
    if (results.filter((v) => !!v).length < files.length) {
      toast.error('Some files not decrypted', {
        duration: 4000,
      })
    } else
      toast.success(
        'Files unlocked! You can find them next to the locked file.',
        {
          duration: 6000,
        },
      )
    resetLocalState()
  }

  const DecryptionFlow = () => (
    <Box padding={5}>
      <GridLayout className="file-viewer">
        {files.map((filepath) => (
          <Box padding={2} background="neutral100" key={filepath}>
            <FileListItem title={path.basename(filepath)} tooltip={filepath} />
            <Divider />
          </Box>
        ))}
      </GridLayout>

      <Box>
        <Button
          onClick={beginDecryption}
          startIcon={<Lock />}
          disabled={inProgress}
          size="L"
          variant="primary"
          fullWidth
        >
          DECRYPT
        </Button>
      </Box>

      {inProgress && (
        <Box padding={5} className="u-center">
          <Loader>Loading content...</Loader>
        </Box>
      )}
    </Box>
  )

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      style={{ height: '80vh' }}
    >
      <Toaster position="bottom-center" />
      <Box padding={5}>
        <Box padding={4} className="u-center">
          <Button
            onClick={selectFiles}
            endIcon={<Plus />}
            variant="secondary"
            size="L"
          >
            Add .ucrypt files
          </Button>
        </Box>
        <Box className="u-center">
          {files.length ? (
            <DecryptionFlow />
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
