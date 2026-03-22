'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui'

export function DesignSystemDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Apri dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Titolo dialog</DialogTitle>
            <DialogDescription>Descrizione o messaggio.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function DesignSystemDrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Apri drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} side="right" size="md">
        <DrawerContent onClose={() => setOpen(false)}>
          <DrawerHeader>Titolo drawer</DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-text-secondary">Contenuto esempio.</p>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Chiudi
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
