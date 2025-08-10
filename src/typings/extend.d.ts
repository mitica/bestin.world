declare global {
  interface Window {
    sa_event?: (eventName: string, ex?: any) => void;
  }
}
