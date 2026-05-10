import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { MovieCard } from '@/components/movie-card';

// Mock next/image so it doesn't complain about external URLs
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />
  }
}));

describe('MovieCard Component', () => {
  it('renders movie card with correct title, poster, and rating', () => {
    render(
      <MovieCard 
        title="Epic Movie"
        poster="/poster.jpg"
        rating={8.5}
      />
    );

    expect(screen.getByText('Epic Movie')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    
    const image = screen.getByRole('img', { name: 'Epic Movie' });
    expect(image).toHaveAttribute('src', '/poster.jpg');
  });

  it('calls onDetailClick when interacted with', async () => {
    const user = userEvent.setup();
    const handleDetailClick = vi.fn();
    
    render(
      <MovieCard 
        title="Test Movie"
        poster="/test.jpg"
        rating={7.0}
        onDetailClick={handleDetailClick}
      />
    );

    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(handleDetailClick).toHaveBeenCalledTimes(1);
  });

  it('matches semantic accessibility requirements', async () => {
    const { container } = render(
      <MovieCard 
        title="A11y Movie"
        poster="/a11y.jpg"
        rating={9.0}
      />
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);

    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
