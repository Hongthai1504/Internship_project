# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing project stack is materially evidenced by the repository:
- Frontend: static HTML/CSS/JavaScript files under `frontend/` with client-side rendering and multi-page navigation
- Backend: Node.js + Express in `backend/server.js`
- Database: MySQL via `mysql2` and initialization SQL in `backend/init_database.sql`
- Auth and commerce: bcrypt, JWT, express-validator, CORS, rate limiting, and order/payment integrations
- Local product setup: this is a development-ready web app rather than a production deployment target, with the server expected to run locally

## Users

Primary users:
- Shoppers seeking to browse and purchase technology products online
- Admin staff who manage catalog content, products, and operational workflows
- Shipper staff who handle fulfillment or dispatch-related tasks

Secondary/confirmed audience:
- Logged-in customers who need account access, profile data, wishlist, and order history

## Product Purpose

This product is an online technology retail platform aimed at helping users discover, compare, and purchase tech products. Success means a shopper can find relevant products quickly, understand specs and tradeoffs, add items to cart, complete a purchase flow, and manage their account without friction. For staff, success means catalog and order operations remain structured and role-aware.

## Positioning

The product is positioned as a tech-focused commerce experience rather than a generic marketplace. Its differentiator is product detail depth: specification-driven browsing, comparison workflows, search/filtering, and commerce tasks tailored to electronics and related technology categories.

## Operating Context

The project operates in a local web application workflow:
- frontend assets are served as browser-based pages
- backend APIs process catalog, auth, order, and admin logic
- MySQL stores the system’s durable data
- users interact through browser-based shopping flows and admin/shipper dashboards
- the repository includes both English and Vietnamese product/content handling and role-based access paths

## Capabilities and Constraints

Confirmed capabilities:
- Product catalog listing with pagination
- Search and product discovery features
- Detailed product views with specs and galleries
- Cart and wishlist flows
- User registration and login
- JWT-based authenticated sessions
- Order creation and order history-related flows
- Admin product management and role gating
- Shipper/admin role separation
- Product comparison functionality
- Multi-language support for English/Vietnamese labels and content fields
- AI-integrated backend hooks for recommendations or assistant features (evidence in `backend/server.js` via OpenAI/Groq and Google OAuth)

Confirmed constraints and undecided facts:
- The project is not yet documented as having a formal production deployment target or hosting environment
- Payment flow is implemented with a VNPay sandbox pattern and is therefore a local/test payment integration rather than a final production configuration
- The system includes environment-variable configuration for database, auth, and AI credentials, which means secrets are expected to be supplied externally
- Branding and visual direction are not yet formally written as binding product truth; existing UI naming suggests a tech retailer identity, but the exact brand standard remains open

## Brand Commitments

Evidence on hand suggests the project uses a technology retail identity with a product naming convention centered on a modern, product-forward storefront. No formal brand guideline file or binding visual brand specification is present in the repository yet.

## Evidence on Hand

Real project evidence reviewed:
- `README.md`: project overview and architecture summary
- `backend/server.js`: backend APIs, authentication, product, order, admin, and integration logic
- `backend/init_database.sql`: database schema details and core entities
- `frontend/js/core/app.js`: storefront behavior, wishlist/cart logic, search, auth, and account interactions
- `frontend/pages/` and `frontend/css/`: front-end presentation, modules, and shopping flows
- `backend/package.json`: runtime dependencies and server stack

Absences to avoid fabricating:
- No finalized PRODUCT.md existed before this init step
- No formal design direction, visual brand board, or approved marketing claims were found in the repo

## Product Principles

1. Product information should be accurate, comparable, and easy to act on.
2. Commerce flows should remain simple for shoppers and role-aware for staff.
3. Tech purchasing decisions benefit from deep specification context and structured discovery.
4. The system should support secure access and clear operational boundaries between customer, admin, and shipper roles.
5. The project should remain adaptable to real-world local development and future production expansion without losing core commerce functionality.

## Accessibility & Inclusion

No product-specific accessibility requirement or accessibility audit baseline was explicitly documented in the repository. The default assumption is a standard accessible web baseline unless the project later confirms stricter requirements.
