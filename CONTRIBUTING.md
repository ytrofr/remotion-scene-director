# Contributing to Remotion Scene Director

Thank you for your interest in contributing!

## How to Contribute

### Reporting Issues

- Open an issue describing the bug or feature request
- Include reproduction steps for bugs
- Include screenshots/videos for visual issues

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test with `npm run dev` (Remotion Studio)
5. Render a test video: `npm run render`
6. Submit a pull request

### Development Setup

```bash
git clone https://github.com/ytrofr/remotion-scene-director.git
cd remotion-scene-director
npm install
npm run dev    # Opens Remotion Studio on port 3000
```

### Project Structure

```
src/
  compositions/     # Video compositions (each is a separate demo)
  components/       # Reusable components (PhoneMockup, FloatingHand, etc.)
public/
  mobile/           # Screenshot assets
  lottie/           # Lottie animation files
  audio/            # Sound effects
scripts/            # Capture and utility scripts
```

### Code Style

- TypeScript for all source files
- Remotion conventions (useCurrentFrame, useVideoConfig, etc.)
- Use `staticFile()` for assets in `public/`
- Use `random('seed')` instead of `Math.random()` for deterministic renders

### Adding New Compositions

1. Create a directory in `src/compositions/YourDemo/`
2. Register in `src/Root.tsx`
3. Add render script in `package.json`
4. Document in `CLAUDE.md`

### Adding Lottie Animations

1. Download from [LottieFiles](https://lottiefiles.com/free-animations)
2. Save as JSON in `public/lottie/`
3. Keep under 100KB for performance
4. Use `delayRender()` + `continueRender()` pattern

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
