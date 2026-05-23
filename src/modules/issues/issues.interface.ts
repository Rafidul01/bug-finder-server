export interface IIssue{
    title: string,
    description: string,
    type: 'bug' | 'feature_request',
    id: number,
    name: string,
    email: string,
    password: string,
    status?: 'open' | 'in_progress' | 'resolved',
    role?: 'contributor' | 'maintainer'
}