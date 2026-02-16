import { loadFont } from '@remotion/google-fonts/Rubik';

export const { fontFamily } = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
});
