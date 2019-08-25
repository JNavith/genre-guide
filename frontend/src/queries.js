import gql from "graphql-tag";

export const TRACK_FRAGMENT = `
  date {
    year
    monthName: month_name
    day
  }
  id
  name
  artist
  recordLabel: record_label
  image
  subgenresWithHexColorsJSON: subgenres_flat_json(and_colors: HEX)
`;

export const GET_MOST_RECENT_TRACKS = gql`
  {
    tracks {
      ${TRACK_FRAGMENT}
    }
  }
`;

export const getTracksBefore = beforeId => {
  return gql`
    {
      tracks(before_id: "${beforeId}") {
        ${TRACK_FRAGMENT}
      }
    }
  `;
};
