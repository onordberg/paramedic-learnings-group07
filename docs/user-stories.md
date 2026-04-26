# User Stories for GitHub Project Issues

These user stories are written to be small enough to become GitHub Project issues. They are intentionally concrete, but still leave room for participants to make design and implementation decisions.

The repository starts as an empty skeleton. Story 1 is the first feature participants implement — everything that follows builds on it.

## Topic Discovery

### Story 1: Create a topic manually

As a topic owner, I want to create a new topic so that the team has a place to capture and improve guidance for that subject.

Possible acceptance criteria:

- capture title, summary, and an initial guidance text
- record who created the topic
- the new topic appears in the topic list

### Story 2: List ambulance topics

As an ambulance clinician, I want to see a list of operational topics so that I can quickly find relevant guidance.

Possible acceptance criteria:

- show a list of topics
- include topic title and a short summary
- show last updated information

### Story 3: Search topics by keyword

As an ambulance clinician, I want to search topics by keyword so that I can find relevant guidance without browsing manually.

Possible acceptance criteria:

- provide a text search input
- return matching topics based on title or content
- show an empty state when no topics match

### Story 4: Filter topics by area

As an ambulance clinician, I want to filter topics by clinical or operational area so that I can narrow the list to the kind of guidance I need.

Possible acceptance criteria:

- support at least one filter dimension
- show active filters clearly
- allow filters to be cleared

### Story 5: View topic details

As an ambulance clinician, I want to open a topic and read its current guidance so that I understand the current recommendation.

Possible acceptance criteria:

- show title, summary, and detailed guidance
- show who owns the topic
- show when the topic was last updated

### Story 6: See why the guidance exists

As an ambulance clinician, I want to see the rationale behind a recommendation so that I understand why I am expected to work this way.

Possible acceptance criteria:

- show a rationale or explanation section
- link the explanation to one or more supporting sources

## Subscription and Notifications (stretch)

> These stories are stretch material. Notifications add real infrastructure (delivery mechanism, read state, channels) without teaching much about agentic AI workflows. Pick them up only if a team finishes the core slice early.

### Story 7: Subscribe to a topic

As an ambulance clinician, I want to subscribe to a topic so that I am notified when guidance changes.

Possible acceptance criteria:

- allow a user to subscribe from the topic page
- show whether the user is currently subscribed

### Story 8: Notify subscribers about changes

As a subscribed user, I want to be notified when a topic is updated so that I can review the new guidance.

Possible acceptance criteria:

- create a notification when a new topic version is published
- include a link or reference to the updated topic

## Submission of New Information

### Story 9: Submit a debrief report

As an ambulance clinician, I want to submit a debrief report so that field learning can be reviewed and reused.

Possible acceptance criteria:

- capture title, date, and free-text content
- save the report as a source item

### Story 10: Submit a research finding

As a contributor, I want to submit a research finding so that new evidence can be considered against current guidance.

Possible acceptance criteria:

- support a source type for research
- capture source metadata and summary text

### Story 11: Classify source type

As a reviewer, I want each submitted item to have a source type so that evidence can be grouped and interpreted consistently.

Possible acceptance criteria:

- support at least a small fixed list of source types
- show the source type in the source view

## AI-Assisted Analysis

### Story 12: Generate a source summary

As a topic owner, I want a submitted source to have an AI-generated summary so that I can review it faster.

Possible acceptance criteria:

- create and store a generated summary
- show that the summary is system-generated

### Story 13: Suggest related topics

As a reviewer, I want the system to suggest which topic a new source belongs to so that triage is faster.

Possible acceptance criteria:

- generate one or more suggested topics
- show that the suggestions are proposals, not final decisions

### Story 14: Flag possible conflict

As a topic owner, I want the system to flag when new information may conflict with current guidance so that I can review it quickly.

Possible acceptance criteria:

- compare submitted material to current topic guidance
- mark items with a possible conflict state
- show a short reason for the flag

## Review and Approval

### Story 15: Create a change proposal

As a topic owner, I want a possible conflict to produce a draft change proposal so that I can review and refine the suggested update.

Possible acceptance criteria:

- create a change proposal linked to a topic and one or more sources
- include proposed updated guidance text

### Story 16: Review a change proposal

As a topic owner, I want to review and edit a proposed change so that the final text reflects professional judgment.

Possible acceptance criteria:

- show the proposed text
- allow the text to be edited before approval

### Story 17: Approve or reject a proposal

As an approver, I want to approve or reject a change proposal so that only validated guidance becomes current.

Possible acceptance criteria:

- record an approval decision
- record who made the decision
- record when the decision was made

### Story 18: Publish a new topic version

As an approver, I want an approved proposal to create a new topic version so that the updated guidance becomes visible to users.

Possible acceptance criteria:

- create a new topic version on approval
- mark the new version as current

## Traceability and History

### Story 19: View topic version history

As an ambulance clinician, I want to see previous versions of a topic so that I can understand how guidance has changed over time.

Possible acceptance criteria:

- list previous versions
- show publication date for each version

### Story 20: See basis for a topic version

As a reviewer, I want to see what changed in a topic version and which sources support it so that I can understand and assess the basis for the guidance.

Possible acceptance criteria:

- show a human-readable summary of the change
- link the change to the proposal that caused it
- list the source items linked to the version, with title and source type

### Story 21: See who approved a version

As a reviewer, I want to see who approved a topic version so that the approval path is traceable.

Possible acceptance criteria:

- show approver identity on the version view
- show approval timestamp

## Suggested Prioritization

If the course needs a smaller starting backlog, a good first slice is:

1. Story 1: Create a topic manually
2. Story 2: List ambulance topics
3. Story 5: View topic details
4. Story 6: See why the guidance exists
5. Story 9: Submit a debrief report
6. Story 12: Generate a source summary
7. Story 14: Flag possible conflict
8. Story 15: Create a change proposal
9. Story 17: Approve or reject a proposal
10. Story 19: View topic version history

This slice demonstrates the full "AI proposes, human approves" loop end-to-end: a topic owner seeds a topic, a clinician finds it and sees its rationale, someone submits field learning, AI summarizes and conflict-checks it, and a topic owner approves a new version.
