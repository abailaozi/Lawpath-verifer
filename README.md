# Lawpath Verifier

A modern, secure address verification application built with Next.js, featuring user authentication, address validation using Australia Post API, and interactive Google Maps integration.

**Live Demo**: [https://lawpath-verifier.vercel.app/](https://lawpath-verifier.vercel.app/)

## Features

### Authentication System

- **User Registration & Login**: Secure user account management with email/password authentication
- **JWT Token Authentication**: HTTP-only cookies for secure session management
- **Input Normalization**: Automatic trimming and case normalization for consistent data
- **Password Security**: bcrypt hashing with salt rounds for secure password storage

### Address Verification

- **Australia Post API Integration**: Real-time address validation for Australian addresses
- **GraphQL API**: Flexible query interface for address verification
- **Interactive Maps**: Google Maps integration showing verified address locations
- **Comprehensive Validation**: Postcode, suburb, and state validation with detailed error messages

### User Interface

- **Modern Design**: Beautiful gradient-based UI with Tailwind CSS
- **Responsive Layout**: Mobile-first design that works on all devices
- **Real-time Feedback**: Loading states, error handling, and success notifications
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### Data Management

- **Elasticsearch Integration**: Scalable data storage and search capabilities
- **Audit Logging**: Comprehensive logging of all verification attempts
- **Type Safety**: Full TypeScript implementation with strict type checking

## Tech Stack

### Frontend

- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client for data fetching

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **GraphQL Yoga** - GraphQL server implementation
- **JWT (jose)** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **Elasticsearch** - Search and analytics engine

### Testing

- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **JSDOM** - DOM environment for testing

### External Services

- **Australia Post API** - Address validation service
- **Google Maps API** - Interactive mapping service

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lawpath-verifier
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Required Environment Variables
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   USER_INDEX=users
   LOGS_INDEX=verification-logs
   ELASTICSEARCH_URL=your-elasticsearch-url

   # Optional Environment Variables
   NODE_ENV=development
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

### Test Categories

- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint and database interaction testing
- **UI Tests**: User interface and user interaction testing

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── graphql/       # GraphQL endpoint
│   │   ├── login/         # Authentication endpoints
│   │   ├── logout/
│   │   └── register/
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── verifier/          # Address verification page
│   └── __tests__/         # Page component tests
├── components/            # Reusable UI components
│   └── ui/
│       ├── Map.tsx        # Google Maps component
│       └── VerifierForm.tsx # Address verification form
├── lib/                   # Utility libraries
│   ├── auth.ts           # JWT authentication utilities
│   ├── elastic.ts        # Elasticsearch client
│   ├── userRepo.ts       # User data management
│   └── logRepo.ts        # Logging utilities
├── middleware.ts          # Next.js middleware for auth
├── types/                 # TypeScript type definitions
└── __tests__/            # Test utilities and setup
```

## API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Address Verification

- `POST /api/graphql` - GraphQL endpoint for address verification

### GraphQL Schema

```graphql
type Query {
  validate(
    postcode: String!
    suburb: String!
    state: String!
  ): ValidationResult!
}

type ValidationResult {
  success: Boolean!
  message: String!
  latitude: Float
  longitude: Float
}
```

## Security Features

- **HTTP-Only Cookies**: Secure token storage
- **Input Sanitization**: Automatic trimming and normalization
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **CORS Protection**: Proper cross-origin request handling
- **Rate Limiting**: Built-in protection against abuse

## Deployment

### Vercel (Recommended)

 **Production Deployment**: [https://lawpath-verifier.vercel.app/](https://lawpath-verifier.vercel.app/)

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   - `JWT_SECRET` - Your secure JWT signing secret
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
   - `USER_INDEX` - Elasticsearch users index name
   - `LOGS_INDEX` - Elasticsearch logs index name
   - `ELASTICSEARCH_URL` - Your Elasticsearch cluster URL
3. Deploy automatically on push to main branch

### Required Environment Variables for Production

```env
JWT_SECRET=your-production-jwt-secret-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
USER_INDEX=users
LOGS_INDEX=verification-logs
ELASTICSEARCH_URL=your-elasticsearch-production-url
NODE_ENV=production
```

### Other Platforms

- **Docker**: Use the included Dockerfile
- **AWS**: Deploy using AWS Amplify or Lambda
- **Google Cloud**: Use Cloud Run or App Engine

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Caching**: Intelligent caching strategies for API responses

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@lawpath.com or create an issue in the GitHub repository.

## Version History

- **v0.1.0** - Initial release with core address verification features
- **v0.1.1** - Added comprehensive testing suite
- **v0.1.2** - Enhanced security features and input validation
- **v0.1.3** - Improved UI/UX and mobile responsiveness

---

Built with love by the Lawpath team
