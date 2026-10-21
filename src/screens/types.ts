export interface Nav {
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  restart: () => void;
}
