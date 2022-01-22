import { Box } from '@strapi/design-system/Box'
import { Tooltip } from '@strapi/design-system/Tooltip'
import { Typography } from '@strapi/design-system/Typography'
import File from '@strapi/icons/File'

type Props = {
  title: string
  tooltip: string
}

export default function FileListItem({ title, tooltip }: Props) {
  const listItem = (
    <Typography variant="h2" textColor="secondary600">
      <File /> {title}
    </Typography>
  )

  return (
    <Box className="u-list-item">
      {tooltip ? <Tooltip description={tooltip}>{listItem}</Tooltip> : listItem}
    </Box>
  )
}
