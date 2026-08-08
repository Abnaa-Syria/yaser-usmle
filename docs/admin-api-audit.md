# Admin Dashboard API Audit

## Scope
- Frontend pages under `src/pages/admin`
- Backend routes mounted in `backend/src/server.ts`

## Page-by-page Matrix

| Page | Required endpoints | Available endpoints | Missing backend endpoints / gaps |
|---|---|---|---|
| `/admin` Overview | stats, chart KPIs | `GET /api/v1/admin/dashboard/stats` | No dedicated analytics endpoints for advanced charts |
| `/admin/students` | list/filter students | `GET /api/v1/admin/users?role=STUDENT` | No dedicated student analytics summary endpoint |
| `/admin/students/:id` | student profile/details | `GET /api/v1/admin/users/:id` | No student enrollments/activity timeline endpoint |
| `/admin/instructors/list` | list/filter instructors | `GET /api/v1/admin/instructors` | No instructor performance aggregate endpoint |
| `/admin/instructors/:id` | instructor profile + details | `GET /api/v1/admin/instructors/:id` | No instructor courses/reviews aggregate endpoint |
| `/admin/instructors/payouts` | list/process payouts | `GET /api/v1/admin/payouts`, `PATCH /api/v1/admin/payouts/:id/process` | No payout “period” field in current response contract |
| `/admin/courses` | list/filter courses | ⚠️ frontend expects `GET /api/v1/admin/courses`; backend currently exposes only create/update/delete | **Missing `GET /admin/courses` and `GET /admin/courses/:id`** |
| `/admin/courses/new` | create course | `POST /api/v1/admin/courses` | Missing module/lesson nested create endpoints in one transaction |
| `/admin/courses/categories` | category CRUD | `GET/POST/PATCH/DELETE /api/v1/admin/categories` | No localized category names contract (EN/AR) |
| `/admin/enrollments` | enrollment history list | no direct endpoint | **Missing `GET /api/v1/admin/enrollments`** |
| `/admin/enrollments/new` | enroll student | no direct endpoint | **Missing `POST /api/v1/admin/enrollments`** |
| `/admin/tickets` | ticket list/process | `GET /api/v1/admin/tickets`, `PATCH /api/v1/admin/tickets/:id/process` | No dedicated `GET /admin/tickets/:id` endpoint |
| `/admin/tickets/:id` | ticket detail/thread | partial (list includes basic data) | **Missing detailed by-id endpoint** |
| `/admin/cms/pages` | page CRUD | partial CMS endpoints (`/admin/cms/faq`, `/sections`, `/about-us`) | **Missing pages/posts/media/banners resources** |
| `/admin/cms/posts` | posts CRUD | not available | **Missing posts endpoints** |
| `/admin/cms/announcements` | announcements CRUD | not available | **Missing announcements endpoints** |
| `/admin/cms/media` | media library CRUD | not available | **Missing media endpoints** |
| `/admin/cms/banners` | banners CRUD | not available | **Missing banners endpoints** |
| `/admin/settings` | general settings | not available | **Missing platform settings endpoint** |
| `/admin/settings/roles` | role permissions matrix | not available | **Missing roles/permissions endpoints** |
| `/admin/settings/emails` | template list/edit/test | not available | **Missing email-template endpoints** |
| `/admin/settings/integrations` | integration configs | not available | **Missing integrations endpoints** |

## Extra frontend pages with weak/no API backing (currently mocked/partial)
- `StudentDetail` enrollments/timeline cards
- `InstructorDetail` courses/reviews/payout-history cards
- `Courses` list/detail (until backend read endpoints are added)
- `Enrollments`, `EnrollStudent`
- CMS sub-pages (`posts`, `announcements`, `media`, `banners`)
- Settings sub-pages (`roles`, `emails`, `integrations`)

## API available but no dedicated frontend page yet
- `POST/PATCH/DELETE /api/v1/admin/classes`
- `POST/PATCH/DELETE /api/v1/admin/units`
- `POST/PATCH/DELETE /api/v1/admin/lessons`
- `POST/PATCH/DELETE /api/v1/admin/exams`

