# Tractor Comparison Project

Compare tractors by company, HP, cylinders (3 / 4 / 6), RPM, color, lift, fuel tank, drive and price.
Includes search, filters, login, comparison table with "best" highlighting, a 3D tractor viewer (Three.js)
and a "Find my tractor" requirement matcher.

## Workflow

```
USER (Farmer / Dealer)
   |
FRONTEND (HTML + CSS + JavaScript)  ->  Search | Filters | Login
   |
TRACTOR CATALOG (Company / Model / HP ...)
   |
SPRING BOOT API:  Controller -> Service -> Repository
   |
MySQL (tractor table: HP | RPM | Cylinders | Lift | 4WD ...)
   |
Details  |  Comparison  |  3D View (Three.js)
   |            |
Specs       Comparison table -> Requirement matching -> Suitable tractor options
```

## Run option A: frontend only (no setup)
Open `backend/src/main/resources/static/index.html` in a browser. It uses built-in demo data (js/data.js).
Internet is needed for the Three.js CDN (3D view) and Google Fonts.

## Run option B: full stack (Spring Boot + MySQL)
1. Install JDK 17+, Maven and MySQL.
2. Edit MySQL user/password in `backend/src/main/resources/application.properties`.
3. Run:
   ```
   cd backend
   mvn spring-boot:run
   ```
4. Open http://localhost:8080 (the database `tractor_db` and 23 sample tractors are created automatically).

## REST API
| Method | URL | Purpose |
|---|---|---|
| GET | `/api/tractors?q=&company=&minHp=&maxHp=&cylinders=&drive=&maxPrice=` | search and filter |
| GET | `/api/tractors/{id}` | one tractor |
| GET | `/api/tractors/compare?ids=1,2,3` | tractors for comparison |
| POST | `/api/auth/register`, `/api/auth/login` | demo login (BCrypt) |

## How "best" is decided
Score out of 100 = power 35 + lift capacity 15 + cylinders 15 + RPM 5 + 4WD 10 (2WD 4) + value for money (HP per lakh) 20.
Change the weights in `score()` in `js/app.js`.

## Add your own tractors
Add rows to `data.sql` (INSERT IGNORE) or insert into the `tractor` table. Fields: company, model, hp, cylinders, rpm,
color, color_hex (3D paint), fuel_tank, lift_kg, drive, gears, price_lakh, description.

## Important
HP, RPM, price and other values are sample/approximate for demonstration. Verify with the manufacturer or dealer before buying.
The 3D tractor is a procedural model generated from the data, not an exact CAD model of each brand.
To use real photos or GLB models, add `image` / model URLs per tractor and load them with Three.js GLTFLoader.
