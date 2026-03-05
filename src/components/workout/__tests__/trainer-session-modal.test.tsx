import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TrainerSessionModal } from '../trainer-session-modal'

describe('TrainerSessionModal', () => {
  it('renders modal with Completamento Allenamento and two options', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(
      <TrainerSessionModal open={true} onClose={onClose} onConfirm={onConfirm} />,
    )
    expect(screen.getByText('Completamento Allenamento')).toBeInTheDocument()
    expect(screen.getByText(/Come hai completato questo allenamento?/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Eseguito con Trainer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Eseguito da Solo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Annulla/i })).toBeInTheDocument()
  })

  it('calls onConfirm(true) when clicking Eseguito con Trainer', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(
      <TrainerSessionModal open={true} onClose={vi.fn()} onConfirm={onConfirm} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Eseguito con Trainer/i }))
    expect(onConfirm).toHaveBeenCalledWith(true)
  })

  it('calls onConfirm(false) when clicking Eseguito da Solo', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(
      <TrainerSessionModal open={true} onClose={vi.fn()} onConfirm={onConfirm} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Eseguito da Solo/i }))
    expect(onConfirm).toHaveBeenCalledWith(false)
  })

  it('disables action buttons when loading', () => {
    render(
      <TrainerSessionModal open={true} onClose={vi.fn()} onConfirm={vi.fn()} loading={true} />,
    )
    const loadingButtons = screen.getAllByRole('button', { name: /Elaborazione/i })
    expect(loadingButtons.length).toBe(2)
    loadingButtons.forEach((btn) => expect(btn).toBeDisabled())
  })
})
