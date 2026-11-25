export type Activity = 'walk' | 'pause';
export type Finish = 'blue' | 'silver' | 'ink';
export type Person = { id: string; name: string; message: string; activity: Activity; finish: Finish };
export type Submission = Person & { status: 'pending' | 'approved' | 'rejected'; created_at: string };
export type Draft = Omit<Person, 'id'>;
