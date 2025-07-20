# VibeBoard AI - Your Mood, Visualized
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database interface
├── shared/              # Shared schemas and types
└── components.json      # shadcn/ui configuration
```
[![Watch the demo](https://img.youtube.com/vi/[VIDEO_ID](https://youtu.be/HYuw4Iynwg0)/hqdefault.jpg)](https://www.youtube.com/watch?v=[VIDEO_ID](https://youtu.be/HYuw4Iynwg0))

### Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **AI/CV**: OpenCV.js, OpenAI GPT-4o, Unsplash API
- **Build**: Vite, esbuild
- **Database**: PostgreSQL, Neon (hosted)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing advanced AI capabilities
- **Unsplash** for beautiful, high-quality imagery
- **OpenCV.js** for powerful client-side computer vision
- **Spotify** for music integration
- **shadcn/ui** for the elegant component library

## 🐛 Troubleshooting

### Common Issues

**OpenCV.js Loading Issues**
- Ensure stable internet connection for CDN loading
- Check browser console for loading errors
- Fallback systems are in place for graceful degradation

**API Quota Exceeded**
- The system includes fallback quote collections
- Check your OpenAI billing and usage
- Unsplash has generous free tier limits

**Database Connection Issues**
- Verify DATABASE_URL environment variable
- Ensure PostgreSQL service is running
- Check network connectivity to database

### Support

For issues and questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure API keys have proper permissions
4. Check network connectivity for external APIs

## 🔮 Future Enhancements

- **Voice mood input** using speech recognition
- **Collaborative moodboards** for shared experiences
- **Mood journaling** and tracking over time
- **AR filters** for real-time mood visualization
- **Integration with more music services** (Apple Music, YouTube Music)
- **Advanced computer vision** with emotion intensity scoring

---
[![💻 Built at TinkerSpace](https://img.shields.io/badge/Built%20at-TinkerSpace-blueviolet?style=for-the-badge&label=%F0%9F%92%BBBuilt%20at&labelColor=turquoise&color=white)](https://tinkerhub.org/tinkerspace)

Made with ❤️ using React, OpenAI, OpenCV.js, and creative passion.
