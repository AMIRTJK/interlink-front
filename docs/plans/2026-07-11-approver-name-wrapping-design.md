# Design: Approver Full Name Wrapping in Correspondence List

## Goal
Show the full name of added approvers/participants in correspondence workflows without truncation (ellipsis), wrapping long names onto new lines.

## Proposed Changes
We will replace the `truncate` utility class in Tailwind CSS with the `break-words` class (or remove it to allow default wrapping) for the following components:

### 1. `src/widgets/CreateInternalCorrespondence/ui/ApproverItem.tsx`
- Replace `truncate` with `break-words` on the name and role of the approver.

### 2. `src/widgets/InternalCorrespondenceIncomingView/ApproversPanel.tsx`
- Replace `truncate` with `break-words` on the name of the approver.

### 3. `src/widgets/InternalCorrespondece/ui/WorkflowParticipantsPanel.tsx`
- Replace `truncate` with `break-words` on the `fullName` span and the `position` div.

## Verification
- Verify code compiles without warnings/errors.
