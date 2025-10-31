# Install Dependencies for References Feature

Run the following command to install the required dependencies for the enhanced References feature:

```bash
npm install xml2js
npm install --save-dev @types/xml2js
```

These packages are needed for:
- `xml2js`: Parse XML responses from PubMed API
- `@types/xml2js`: TypeScript type definitions for xml2js

After installation, the References feature will be able to:
1. Search real articles from SciELO using their official API
2. Search validated articles from PubMed/NCBI
3. Validate article authenticity
4. Deduplicate results across sources
5. Rank articles by relevance

The feature is now production-ready with real scientific article search capabilities!
