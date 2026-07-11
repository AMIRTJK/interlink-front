# Design: Approver & Signer Full Name Wrapping in Correspondence List

## Goal
Show the full name of added approvers and signers in correspondence workflows without truncation (ellipsis), wrapping long names onto new lines.

## Proposed Changes
We will replace the `truncate` utility class in Tailwind CSS with the `break-words` class (or remove it to allow default wrapping) for the following components:

### Approvers (Согласующие)
1. `src/widgets/CreateInternalCorrespondence/ui/ApproverItem.tsx`
   - Replace `truncate` with `break-words` on the name and role of the approver.
2. `src/widgets/InternalCorrespondenceIncomingView/ApproversPanel.tsx`
   - Replace `truncate` with `break-words` on the name of the approver.

### Signers (Подписывающие)
1. `src/widgets/CreateInternalCorrespondence/ui/SignerCard.tsx`
   - Replace `truncate` with `break-words` on the name and role of the signer.
2. `src/widgets/InternalCorrespondenceIncomingView/SignersPanel.tsx`
   - Replace `truncate` with `break-words` on the name of the signer.

### Shared Panel (История/Участники)
1. `src/widgets/InternalCorrespondece/ui/WorkflowParticipantsPanel.tsx`
   - Replace `truncate` with `break-words` on the `fullName` span and the `position` div.
   - Replace native `title` tooltips with custom `<Tooltip>` from `@shared/ui`.

## Verification
- Verify code compiles without warnings/errors.
