import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";

import { TBtn } from "../../TBtn";

interface IProps {
  isReadOnly: boolean;
  activeFmt: Record<string, boolean>;
  execCmd: (command: string, value?: string) => void;
}

export const ToolbarParagraphGroup = ({
  isReadOnly,
  activeFmt,
  execCmd,
}: IProps) => (
  <>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.justifyLeft}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("justifyLeft");
      }}
      title="По левому краю"
    >
      <AlignLeft size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.justifyCenter}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("justifyCenter");
      }}
      title="По центру"
    >
      <AlignCenter size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.justifyRight}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("justifyRight");
      }}
      title="По правому краю"
    >
      <AlignRight size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.justifyFull}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("justifyFull");
      }}
      title="По ширине"
    >
      <AlignJustify size={14} />
    </TBtn>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.insertUnorderedList}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("insertUnorderedList");
      }}
      title="Маркированный список"
    >
      <List size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.insertOrderedList}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("insertOrderedList");
      }}
      title="Нумерованный список"
    >
      <ListOrdered size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("insertHorizontalRule");
      }}
      title="Горизонтальная линия"
    >
      <Minus size={14} />
    </TBtn>
  </>
);
