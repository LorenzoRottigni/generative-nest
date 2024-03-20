import ts from 'typescript'
import fs from 'fs'

export const capitalize = (str: string): string => `${str.charAt(0).toUpperCase()}${str.slice(1)}`
