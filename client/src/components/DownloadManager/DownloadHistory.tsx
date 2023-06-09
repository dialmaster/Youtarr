import React, { useRef, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Popover,
  Typography,
  IconButton,
  ClickAwayListener,
  Checkbox,
  Toolbar,
  FormControlLabel,
  Box,
  Pagination,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { formatDuration } from '../../utils';
import { Job } from '../../types/Job';
import { useSwipeable } from 'react-swipeable';

interface DownloadHistoryProps {
  jobs: Job[];
  currentTime: Date;
  expanded: Record<string, boolean>;
  anchorEl: Record<string, null | HTMLButtonElement>;
  handleExpandCell: (id: string) => void;
  setAnchorEl: React.Dispatch<
    React.SetStateAction<Record<string, null | HTMLButtonElement>>
  >;
  isMobile: boolean;
}

const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  jobs,
  currentTime,
  expanded,
  anchorEl,
  handleExpandCell,
  setAnchorEl,
  isMobile,
}) => {
  const [showNoVideoJobs, setShowNoVideoJobs] = useState(false);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  // If showNoVideoJobs is true, show all jobs, otherwise only show jobs with videos
  let jobsToDisplay = jobs.filter((job) => {
    if (showNoVideoJobs) {
      return true;
    } else {
      if (!job.data?.videos) {
        return true;
      } else {
        return job.data?.videos && job.data.videos.length > 0;
      }
    }
  });

  // calculate total pages
  const totalPages = Math.ceil(jobsToDisplay.length / itemsPerPage);

  // get current jobs
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;

  let currentJobs = jobsToDisplay.slice(indexOfFirstJob, indexOfLastJob);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < Math.ceil(jobsToDisplay.length / itemsPerPage)) {
        setCurrentPage(currentPage + 1);
      }
    },
    onSwipedRight: () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    trackMouse: true,
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  return (
    <Grid item xs={12} md={12} paddingBottom={'48px'}>
      <Card elevation={8}>
        <CardHeader
          title='Download History'
          align='center'
          style={{ marginBottom: '-16px' }}
        />
        <Grid container spacing={2} justifyContent='center'>
          <Grid item>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => handlePageChange(page)}
            />
          </Grid>
        </Grid>

        <CardContent style={{ paddingTop: '0px' }}>
          <Toolbar style={{ minHeight: '42px' }}>
            <Box display='flex' justifyContent='center' width='100%'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showNoVideoJobs}
                    onChange={(event) => {
                      setShowNoVideoJobs(event.target.checked);
                      setCurrentPage(1); // Reset the page number to 1
                    }}
                    inputProps={{ 'aria-label': 'Show jobs with no videos' }}
                  />
                }
                label='Show jobs with no videos'
              />
            </Box>
          </Toolbar>
          <TableContainer>
            <div {...handlers}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        fontSize: isMobile ? 'small' : 'medium',
                        fontWeight: 'bold',
                      }}
                    >
                      Job Type
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: isMobile ? 'small' : 'medium',
                        fontWeight: 'bold',
                      }}
                    >
                      Created
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: isMobile ? 'small' : 'medium',
                        fontWeight: 'bold',
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      style={{
                        fontSize: isMobile ? 'small' : 'medium',
                        fontWeight: 'bold',
                      }}
                    >
                      Videos
                    </TableCell>
                  </TableRow>
                </TableHead>
                {jobs.length === 0 && (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4}>
                        No jobs currently running
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                <TableBody>
                  {currentJobs.map((job, index) => {
                    const isExpanded = expanded[job.id] || false;
                    let durationString = '';
                    if (job.status !== 'In Progress') {
                      durationString = job.status;
                    } else {
                      const jobStartTime = new Date(
                        job.timeInitiated
                      ).getTime(); // Convert to milliseconds
                      const duration = new Date(
                        currentTime.getTime() - jobStartTime
                      ); // Subtract in milliseconds                    const hh = String(duration.getUTCHours()).padStart(2, '0');
                      const mm = String(duration.getUTCMinutes()).padStart(
                        2,
                        '0'
                      );
                      const ss = String(duration.getUTCSeconds()).padStart(
                        2,
                        '0'
                      );
                      durationString = `${mm}m${ss}s`;
                    }
                    let timeCreated = new Date(job.timeCreated);
                    let month = String(timeCreated.getMonth() + 1).padStart(
                      2,
                      '0'
                    ); // Add 1 to month and pad with 0s
                    let day = String(timeCreated.getDate()).padStart(2, '0'); // Pad with 0s

                    let minutes = String(timeCreated.getMinutes()).padStart(
                      2,
                      '0'
                    ); // Pad with 0s
                    // Convert 24-hour format to 12-hour format
                    let hours = timeCreated.getHours();
                    let period = hours >= 12 ? 'PM' : 'AM';
                    let videosText = job.data?.videos
                      ? job.data.videos.length > 0
                        ? `${job.data.videos.length}`
                        : 'None'
                      : 'None';

                    if (job.status === 'In Progress') {
                      videosText = '---';
                    }
                    let formattedJobType = '';
                    if (job.jobType === 'Channel Downloads') {
                      formattedJobType = 'Channel';
                    } else if (job.jobType === 'Manually Added Urls') {
                      formattedJobType = 'Manual Videos';
                    }

                    // Adjust hours
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'

                    // Combine into a formatted string
                    let formattedTimeCreated = `${month}-${day} ${hours}:${minutes} ${period}`;

                    return (
                      <TableRow key={index}>
                        <TableCell
                          style={{ fontSize: isMobile ? 'small' : 'medium' }}
                        >
                          {formattedJobType}
                        </TableCell>
                        <TableCell
                          style={{ fontSize: isMobile ? 'small' : 'medium' }}
                        >
                          {formattedTimeCreated}
                        </TableCell>
                        <TableCell
                          style={{ fontSize: isMobile ? 'small' : 'medium' }}
                        >
                          {durationString}
                        </TableCell>
                        <TableCell
                          style={{ fontSize: isMobile ? 'small' : 'medium' }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {job.data?.videos?.length > 0 && (
                              <>
                                <IconButton
                                  ref={(ref) =>
                                    (buttonRefs.current[job.id] = ref)
                                  }
                                  onClick={(
                                    event: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    setAnchorEl({
                                      ...anchorEl,
                                      [job.id]: anchorEl[job.id]
                                        ? null
                                        : event.currentTarget,
                                    });
                                  }}
                                >
                                  {' '}
                                  <InfoIcon fontSize='small' />
                                </IconButton>
                                <Popover
                                  open={Boolean(anchorEl[job.id])}
                                  anchorEl={anchorEl[job.id]}
                                >
                                  <ClickAwayListener
                                    onClickAway={(event) => {
                                      const isIconButton = buttonRefs.current[
                                        job.id
                                      ]?.contains(event.target as Node);

                                      if (!isIconButton) {
                                        setAnchorEl({
                                          ...anchorEl,
                                          [job.id]: null,
                                        });
                                      }
                                    }}
                                  >
                                    <div
                                      style={{
                                        padding: '8px',
                                        backgroundColor: '#f5f5f5',
                                        maxWidth: isMobile ? '85vw' : '320px',
                                        wordBreak: 'break-word',
                                      }}
                                    >
                                      <Typography sx={{ padding: 2 }}>
                                        {job.data?.videos?.map((video: any) => (
                                          <p key={video.youtubeId}>
                                            {video.youTubeChannelName} -{' '}
                                            {video.youTubeVideoName}
                                            {video.duration && (
                                              <Typography
                                                variant='caption'
                                                color='text.secondary'
                                              >
                                                {' '}
                                                (
                                                {formatDuration(video.duration)}
                                                )
                                              </Typography>
                                            )}
                                          </p>
                                        ))}
                                      </Typography>
                                    </div>
                                  </ClickAwayListener>
                                </Popover>{' '}
                              </>
                            )}

                            {isExpanded ? (
                              <div
                                style={{
                                  maxWidth: isMobile ? '125px' : '100%',
                                }}
                              >
                                {videosText}
                              </div>
                            ) : (
                              <div
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {videosText}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DownloadHistory;
