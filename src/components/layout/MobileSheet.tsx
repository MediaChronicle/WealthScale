import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface MobileSheetProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function MobileSheet({
  title,
  open,
  onOpenChange,
  children,
}: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[70vh] overflow-y-auto rounded-t-2xl border-ws-border bg-ws-bg/95 backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-ws-text-primary">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
