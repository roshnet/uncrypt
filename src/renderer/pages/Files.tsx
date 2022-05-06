import { Badge } from '@strapi/design-system/Badge'
import { Box } from '@strapi/design-system/Box'
import { Divider } from '@strapi/design-system/Divider'
import { Flex } from '@strapi/design-system/Flex'
import { GridLayout } from '@strapi/design-system/Layout'
import { Loader } from '@strapi/design-system/Loader'
import { Typography } from '@strapi/design-system/Typography'
import { ipcRenderer } from 'electron'
import { FileRecord } from 'entities'
import path from 'path'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import FileListItem from '../components/FileListItem'

export default function FilesScreen() {
  const [files, setFiles] = useState<FileRecord[]>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async function () {
      const allFiles = await ipcRenderer.invoke('GET_ALL_FILES')
      setFiles(allFiles)
      setLoading(false)
    })()
  }, [])

  const FileView = () => (
    <Box padding={5}>
      <GridLayout>
        {files.map((fileRecord) => (
          <Box padding={2} background="neutral100" key={fileRecord._id}>
            <FileListItem
              title={path.basename(fileRecord.path)}
              tooltip={fileRecord.path}
            />
            <Badge style={{ marginTop: 10 }}>
              {fileRecord.op === 'enc' ? 'Encrypted' : 'Decrypted'}
            </Badge>
            <Divider />
          </Box>
        ))}
      </GridLayout>
    </Box>
  )

  if (loading) return <Loader>Loading...</Loader>

  return (
    <Flex style={{}}>
      <Toaster position="bottom-center" />
      <Box padding={1} style={{ width: '100%' }}>
        <Box>
          {loading && <Loader>Loading...</Loader>}
          {files.length ? (
            <FileView />
          ) : (
            <Typography variant="pi">
              Files you encrypt or decrypt will appear here.
            </Typography>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
