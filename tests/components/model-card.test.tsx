import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModelCard } from '../../src/components/features/model-card'

describe('ModelCard', () => {
  it('displays model name', () => {
    render(<ModelCard model="gfs" temperature={15} isLoading={false} />)
    expect(screen.getByText('GFS')).toBeInTheDocument()
  })

  it('displays temperature', () => {
    render(<ModelCard model="ecmwf-hres" temperature={22} isLoading={false} />)
    expect(screen.getByText('22°')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ModelCard model="gem" isLoading={true} />)
    expect(screen.getByTestId('model-card-loading')).toBeInTheDocument()
  })
})
