# Habits - Personal Habit Tracking App

A full-stack habit tracking web application built with React/TypeScript frontend and Go backend with SQLite database. Track your daily habits, monitor streaks, and visualize your progress with clean, minimal design.

## ✨ Features

- **Habit Management**: Create and manage daily, weekly, or multiple-times-per-week habits
- **Streak Tracking**: Monitor current and longest streaks for each habit
- **Progress Visualization**: View completion rates and trends with interactive charts
- **Clean UI**: Minimal, responsive design focused on your data
- **Local Storage**: SQLite database keeps your data private and local
- **Real-time Updates**: Instant feedback on habit completions and progress

## 🎯 Key Capabilities

- **Flexible Habit Types**: Support for daily, weekly, and custom frequency habits
- **Smart Tracking**: Automatic streak calculation and completion rate analysis
- **Data Insights**: Comprehensive statistics and visualizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Fast Performance**: Lightweight Go backend with efficient SQLite storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habits.git
   cd habits
   ```

2. **Start the backend server**
   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```
   The server will start on `http://localhost:8080`

3. **Start the frontend application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app will open in your browser at `http://localhost:5173`

## 📱 Usage

### Creating Habits
1. Navigate to the "New Habit" page
2. Enter habit name and description
3. Choose frequency (daily, weekly, or multiple times per week)
4. Set target count if applicable
5. Save your habit

### Tracking Progress
- **Dashboard**: Overview of all habits with current streaks
- **Habit List**: Complete view of all habits with completion status
- **Individual Habit View**: Detailed statistics and charts for each habit
- **Stats Page**: Comprehensive analytics and trends
- **Charts Page**: Visual data analysis and progress tracking

### Marking Completions
- Click the completion button on any habit card
- View instant updates to streaks and statistics
- Track your progress over time with visual charts

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for clean, minimal styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Go** with standard library for performance
- **SQLite** for local data storage
- **RESTful API** with JSON responses
- **CORS** enabled for local development

## 📁 Project Structure
```
habits/
├── backend/          # Go backend server
│   ├── main.go      # Server entry point
│   ├── handlers/    # HTTP request handlers
│   ├── models/      # Data models
│   └── database/    # Database utilities
├── frontend/        # React TypeScript app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript definitions
│   └── public/      # Static assets
└── database/        # SQLite database files
```

## 🛠️ Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
# Backend
cd backend
go build -o habits

# Frontend
cd frontend
npm run build
```

## 📊 API Endpoints

- `GET /api/habits` - List all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit as completed
- `GET /api/habits/:id/stats` - Get habit statistics
- `GET /api/stats` - Get overall statistics
- `GET /api/charts/*` - Get chart data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Go](https://golang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Start building better habits today!** 🎯