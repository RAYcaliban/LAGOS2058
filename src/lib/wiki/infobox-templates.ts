import type { WikiPageType } from '@/lib/types/wiki'
import type { InfoboxSection } from '@/lib/types/wiki'

export interface InfoboxTemplate {
  name: string
  sections: InfoboxSection[]
}

const partyTemplate: InfoboxTemplate = {
  name: 'Political Party',
  sections: [
    {
      heading: 'General',
      fields: [
        { key: 'abbreviation', label: 'Abbreviation', value: '' },
        { key: 'full_name', label: 'Full name', value: '' },
        { key: 'leader', label: 'Leader', value: '' },
        { key: 'founded', label: 'Founded', value: '' },
        { key: 'ideology', label: 'Ideology', value: '' },
        { key: 'ethnicity', label: 'Ethnicity', value: '' },
        { key: 'religion', label: 'Religion', value: '' },
        { key: 'color', label: 'Color', value: '' },
        { key: 'hq', label: 'Headquarters', value: '' },
      ],
    },
    {
      heading: 'Electoral strength',
      fields: [
        { key: 'seats', label: 'Seats', value: '' },
        { key: 'lgas', label: 'LGAs held', value: '' },
      ],
    },
  ],
}

const characterTemplate: InfoboxTemplate = {
  name: 'Person',
  sections: [
    {
      heading: 'Personal details',
      fields: [
        { key: 'born', label: 'Born', value: '' },
        { key: 'ethnicity', label: 'Ethnicity', value: '' },
        { key: 'religion', label: 'Religion', value: '' },
        { key: 'nationality', label: 'Nationality', value: '' },
        { key: 'education', label: 'Education', value: '' },
        { key: 'spouse', label: 'Spouse', value: '' },
      ],
    },
    {
      heading: 'Political career',
      fields: [
        { key: 'party', label: 'Party', value: '' },
        { key: 'office', label: 'Office', value: '' },
        { key: 'predecessor', label: 'Predecessor', value: '' },
        { key: 'successor', label: 'Successor', value: '' },
      ],
    },
  ],
}

const organizationTemplate: InfoboxTemplate = {
  name: 'Organization',
  sections: [
    {
      heading: 'Details',
      fields: [
        { key: 'type', label: 'Type', value: '' },
        { key: 'founded', label: 'Founded', value: '' },
        { key: 'hq', label: 'Headquarters', value: '' },
        { key: 'key_people', label: 'Key people', value: '' },
        { key: 'membership', label: 'Membership', value: '' },
        { key: 'purpose', label: 'Purpose', value: '' },
      ],
    },
  ],
}

const locationTemplate: InfoboxTemplate = {
  name: 'Location',
  sections: [
    {
      heading: 'Geography',
      fields: [
        { key: 'state', label: 'State', value: '' },
        { key: 'lga', label: 'LGA', value: '' },
        { key: 'az', label: 'Availability Zone', value: '' },
        { key: 'population', label: 'Population', value: '' },
        { key: 'area', label: 'Area', value: '' },
        { key: 'coordinates', label: 'Coordinates', value: '' },
        { key: 'governor', label: 'Governor', value: '' },
      ],
    },
  ],
}

const institutionTemplate: InfoboxTemplate = {
  name: 'Institution',
  sections: [
    {
      heading: 'Details',
      fields: [
        { key: 'type', label: 'Type', value: '' },
        { key: 'jurisdiction', label: 'Jurisdiction', value: '' },
        { key: 'established', label: 'Established', value: '' },
        { key: 'hq', label: 'Headquarters', value: '' },
        { key: 'head', label: 'Head', value: '' },
      ],
    },
  ],
}

const eventTemplate: InfoboxTemplate = {
  name: 'Event',
  sections: [
    {
      heading: 'Details',
      fields: [
        { key: 'date', label: 'Date', value: '' },
        { key: 'location', label: 'Location', value: '' },
        { key: 'outcome', label: 'Outcome', value: '' },
        { key: 'participants', label: 'Participants', value: '' },
        { key: 'cause', label: 'Cause', value: '' },
      ],
    },
  ],
}

const templates: Partial<Record<WikiPageType, InfoboxTemplate>> = {
  party: partyTemplate,
  character: characterTemplate,
  organization: organizationTemplate,
  location: locationTemplate,
  institution: institutionTemplate,
  event: eventTemplate,
}

export function getInfoboxTemplate(pageType: WikiPageType): InfoboxTemplate | null {
  return templates[pageType] ?? null
}
