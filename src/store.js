// Small shared state that outlives page instances.
export const store = {
  activeIndex: 0, // project shown on home; set when visiting a project so "back" lands on it
};
