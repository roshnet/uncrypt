import { Box } from '@strapi/design-system/Box'
import { Button } from '@strapi/design-system/Button'
import { Checkbox } from '@strapi/design-system/Checkbox'
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog'
import { Divider } from '@strapi/design-system/Divider'
import { Flex } from '@strapi/design-system/Flex'
import { GridLayout } from '@strapi/design-system/Layout'
import { Loader } from '@strapi/design-system/Loader'
import { Stack } from '@strapi/design-system/Stack'
import { Typography } from '@strapi/design-system/Typography'
import { ExclamationMarkCircle, Lock, Plus } from '@strapi/icons'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import FileListItem from '../components/FileListItem'

export default function EncryptScreen() {
  const [files, setFiles] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean>(true)
  const [alertDialogShown, setAlertDialogShown] = useState<boolean>(false)
  const [continueDangerously, setContinueDangerously] = useState<boolean>(false)
  const [inProgress, setInProgress] = useState<boolean>(false)
  const results: boolean[] = []

  async function selectFiles() {
    const filePaths = await ipcRenderer.invoke('OPEN_FILE_SELECT')
    setFiles(filePaths)
  }

  const resetLocalState = () => {
    setChecked(true)
    setFiles([])
    setInProgress(false)
    results.length = 0
  }

  async function beginEncryption() {
    if (!checked && !continueDangerously) {
      setAlertDialogShown(true)
      return
    }
    setInProgress(true)
    for (const fp of files) {
      const res = (await ipcRenderer.invoke('ENCRYPT', fp)) as boolean
      results.push(res)
    }
    setInProgress(false)
    if (results.filter((v) => !!v).length < files.length) {
      toast.error('Some files not encrypted', {
        duration: 4000,
      })
    } else
      toast.success(
        'Done! Locked files are saved next to their original files with a ".ucrypt" extension.\n\nTo unlock, use the decryption tab.',
        { duration: 6000 },
      )
    resetLocalState()
  }

  const finalizeSettings = () => {
    setAlertDialogShown(false)
    setContinueDangerously(true)
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

      {alertDialogShown && (
        <Dialog
          title="Hold up! Would you really like to continue?"
          isOpen={alertDialogShown}
        >
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack size={2}>
              <Flex justifyContent="center">
                <Typography>
                  You have opted to not preserve the original files. Doing so
                  will replace the original file with its encrypted version,
                  which won&apos;t be accessible without the key. Please proceed
                  with caution.
                </Typography>
              </Flex>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button
                onClick={() => setAlertDialogShown(false)}
                variant="tertiary"
              >
                Cancel
              </Button>
            }
            endAction={
              <Button onClick={finalizeSettings} variant="danger-light">
                Confirm
              </Button>
            }
          />
        </Dialog>
      )}

      <Box>
        <Button
          onClick={beginEncryption}
          startIcon={<Lock />}
          disabled={inProgress}
          size="L"
          variant={checked ? 'primary' : 'danger-light'}
          fullWidth
        >
          ENCRYPT
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
