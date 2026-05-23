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

export interface IQuery{
    sort: 'newest' | 'oldest',
    type: 'bug' | 'feature_request',
    status: 'open' | 'in_progress' | 'resolved'
}