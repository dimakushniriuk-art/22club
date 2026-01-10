import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  TransitionWrapper,
  QuickTransitionWrapper,
  SlideTransitionWrapper,
  FadeInWrapper,
  StaggerWrapper,
  StaggerItem,
} from '@/components/shared/ui/transition-wrapper'

describe('TransitionWrapper components', () => {
  describe('TransitionWrapper', () => {
    it('renders children correctly', () => {
      render(
        <TransitionWrapper>
          <div data-testid="content">Test Content</div>
        </TransitionWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Test Content')
    })

    it('applies custom className', () => {
      render(
        <TransitionWrapper className="custom-class">
          <div data-testid="content">Test Content</div>
        </TransitionWrapper>,
      )

      const wrapper = screen.getByTestId('content').parentElement
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('QuickTransitionWrapper', () => {
    it('renders children correctly', () => {
      render(
        <QuickTransitionWrapper>
          <div data-testid="content">Quick Content</div>
        </QuickTransitionWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Quick Content')
    })
  })

  describe('SlideTransitionWrapper', () => {
    it('renders children correctly', () => {
      render(
        <SlideTransitionWrapper>
          <div data-testid="content">Slide Content</div>
        </SlideTransitionWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Slide Content')
    })
  })

  describe('FadeInWrapper', () => {
    it('renders children correctly', () => {
      render(
        <FadeInWrapper>
          <div data-testid="content">Fade Content</div>
        </FadeInWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Fade Content')
    })

    it('applies custom delay and duration', () => {
      render(
        <FadeInWrapper delay={0.5} duration={1.0}>
          <div data-testid="content">Fade Content</div>
        </FadeInWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <FadeInWrapper className="fade-custom">
          <div data-testid="content">Fade Content</div>
        </FadeInWrapper>,
      )

      const wrapper = screen.getByTestId('content').parentElement
      expect(wrapper).toHaveClass('fade-custom')
    })
  })

  describe('StaggerWrapper', () => {
    it('renders children correctly', () => {
      render(
        <StaggerWrapper>
          <div data-testid="content">Stagger Content</div>
        </StaggerWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Stagger Content')
    })

    it('applies custom stagger delay', () => {
      render(
        <StaggerWrapper staggerDelay={0.2}>
          <div data-testid="content">Stagger Content</div>
        </StaggerWrapper>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <StaggerWrapper className="stagger-custom">
          <div data-testid="content">Stagger Content</div>
        </StaggerWrapper>,
      )

      const wrapper = screen.getByTestId('content').parentElement
      expect(wrapper).toHaveClass('stagger-custom')
    })
  })

  describe('StaggerItem', () => {
    it('renders children correctly', () => {
      render(
        <StaggerItem>
          <div data-testid="content">Stagger Item</div>
        </StaggerItem>,
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Stagger Item')
    })

    it('applies custom className', () => {
      render(
        <StaggerItem className="item-custom">
          <div data-testid="content">Stagger Item</div>
        </StaggerItem>,
      )

      const wrapper = screen.getByTestId('content').parentElement
      expect(wrapper).toHaveClass('item-custom')
    })
  })
})
