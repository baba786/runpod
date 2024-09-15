// src/components/PodcastSearch.tsx

import React, { ChangeEvent, FormEvent, RefObject } from 'react'
import { Podcast } from '@/types'
import PodcastList from './PodcastList'
import { Button } from './ui/button' // Adjust the import path if necessary

interface PodcastSearchProps {
  inputType: 'minutes' | 'hours' | 'miles'
  inputValue: string
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleTypeChange: (value: 'minutes' | 'hours' | 'miles') => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: string | null
  podcasts: Podcast[]
  hasSearched: boolean
  inputRef: RefObject<HTMLInputElement>
}

const PodcastSearch: React.FC<PodcastSearchProps> = ({
  inputType,
  inputValue,
  handleInputChange,
  handleTypeChange,
  handleSubmit,
  isLoading,
  error,
  podcasts,
  hasSearched,
  inputRef,
}) => {
  return (
    <div className="w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`Enter duration in ${inputType}`}
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleTypeChange('minutes')}
              className={`px-4 py-2 rounded-md border ${
                inputType === 'minutes'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Minutes
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('hours')}
              className={`px-4 py-2 rounded-md border ${
                inputType === 'hours'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Hours
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('miles')}
              className={`px-4 py-2 rounded-md border ${
                inputType === 'miles'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Miles
            </button>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
      {hasSearched && !isLoading && <PodcastList podcasts={podcasts} />}
    </div>
  )
}

export default PodcastSearch
