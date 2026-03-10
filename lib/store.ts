// Local storage utilities for the Build Together platform
// This simulates a backend database using localStorage

export interface User {
  id: string
  name: string
  email: string
  password: string
  bio?: string
  profilePicture?: string
  skills: string[]
  linkedIn?: string
  collegeEmail?: string
  isVerifiedStudent: boolean
  isLinkedInVerified: boolean
  reputation: number
  ideasPosted: string[]
  projectsJoined: string[]
  createdAt: string
}

export interface Idea {
  id: string
  title: string
  problemStatement: string
  fullDescription: string
  skillsRequired: string[]
  contactEmail: string
  postedBy: string
  postedByName: string
  teamMembers: string[]
  createdAt: string
  timestamp: string
}

export interface AccessLog {
  userId: string
  userName: string
  ideaId: string
  ideaTitle: string
  timestamp: string
}

export interface NdaAgreement {
  ideaId: string
  userId: string
  agreedAt: string
}

export interface JoinRequest {
  id: string
  ideaId: string
  userId: string
  userName: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface Comment {
  id: string
  ideaId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'join_request' | 'idea_view' | 'profile_view' | 'nda_signed' | 'join_accepted' | 'join_rejected'
  fromUserId: string
  fromUserName: string
  toUserId: string
  ideaId?: string
  ideaTitle?: string
  message?: string
  read: boolean
  createdAt: string
}

export interface ProfileView {
  id: string
  viewerId: string
  viewerName: string
  viewedUserId: string
  timestamp: string
}

export interface CollaboratorRating {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  ideaId: string
  ideaTitle: string
  rating: number
  review?: string
  createdAt: string
}

// Storage keys
const USERS_KEY = 'build_together_users'
const IDEAS_KEY = 'build_together_ideas'
const ACCESS_LOGS_KEY = 'build_together_access_logs'
const NDA_AGREEMENTS_KEY = 'build_together_nda_agreements'
const CURRENT_USER_KEY = 'build_together_current_user'
const JOIN_REQUESTS_KEY = 'build_together_join_requests'
const COMMENTS_KEY = 'build_together_comments'
const NOTIFICATIONS_KEY = 'build_together_notifications'
const PROFILE_VIEWS_KEY = 'build_together_profile_views'
const RATINGS_KEY = 'build_together_ratings'

// Helper to get data from localStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

// Helper to set data in localStorage
function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// User functions
export function getUsers(): User[] {
  return getStorageItem<User[]>(USERS_KEY, [])
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(user => user.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(user => user.email === email)
}

export function createUser(userData: Omit<User, 'id' | 'reputation' | 'ideasPosted' | 'projectsJoined' | 'createdAt'>): User {
  const users = getUsers()
  const newUser: User = {
    ...userData,
    id: generateId(),
    reputation: 4.0,
    ideasPosted: [],
    projectsJoined: [],
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  setStorageItem(USERS_KEY, users)
  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getUsers()
  const index = users.findIndex(user => user.id === id)
  if (index === -1) return undefined
  users[index] = { ...users[index], ...updates }
  setStorageItem(USERS_KEY, users)
  return users[index]
}

// Current user functions
export function getCurrentUser(): User | null {
  const userId = getStorageItem<string | null>(CURRENT_USER_KEY, null)
  if (!userId) return null
  return getUserById(userId) || null
}

export function setCurrentUser(userId: string | null): void {
  setStorageItem(CURRENT_USER_KEY, userId)
}

export function logout(): void {
  setCurrentUser(null)
}

// Idea functions
export function getIdeas(): Idea[] {
  return getStorageItem<Idea[]>(IDEAS_KEY, [])
}

export function getIdeaById(id: string): Idea | undefined {
  return getIdeas().find(idea => idea.id === id)
}

export function createIdea(ideaData: Omit<Idea, 'id' | 'teamMembers' | 'createdAt' | 'timestamp'>): Idea {
  const ideas = getIdeas()
  const now = new Date()
  const newIdea: Idea = {
    ...ideaData,
    id: generateId(),
    teamMembers: [ideaData.postedBy],
    createdAt: now.toISOString(),
    timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
  }
  ideas.push(newIdea)
  setStorageItem(IDEAS_KEY, ideas)
  
  // Update user's posted ideas
  const user = getUserById(ideaData.postedBy)
  if (user) {
    updateUser(user.id, { ideasPosted: [...user.ideasPosted, newIdea.id] })
  }
  
  return newIdea
}

export function updateIdea(id: string, updates: Partial<Idea>): Idea | undefined {
  const ideas = getIdeas()
  const index = ideas.findIndex(idea => idea.id === id)
  if (index === -1) return undefined
  ideas[index] = { ...ideas[index], ...updates }
  setStorageItem(IDEAS_KEY, ideas)
  return ideas[index]
}

// Access log functions
export function getAccessLogs(): AccessLog[] {
  return getStorageItem<AccessLog[]>(ACCESS_LOGS_KEY, [])
}

export function logAccess(userId: string, userName: string, ideaId: string, ideaTitle: string): void {
  const logs = getAccessLogs()
  logs.push({
    userId,
    userName,
    ideaId,
    ideaTitle,
    timestamp: new Date().toISOString()
  })
  setStorageItem(ACCESS_LOGS_KEY, logs)
  
  // Create notification for idea owner (only if not the owner viewing their own idea)
  const idea = getIdeaById(ideaId)
  if (idea && idea.postedBy !== userId) {
    createNotification({
      type: 'idea_view',
      fromUserId: userId,
      fromUserName: userName,
      toUserId: idea.postedBy,
      ideaId: idea.id,
      ideaTitle: idea.title
    })
  }
}

// NDA functions
export function getNdaAgreements(): NdaAgreement[] {
  return getStorageItem<NdaAgreement[]>(NDA_AGREEMENTS_KEY, [])
}

export function hasSignedNda(userId: string, ideaId: string): boolean {
  return getNdaAgreements().some(nda => nda.userId === userId && nda.ideaId === ideaId)
}

export function signNda(userId: string, userName: string, ideaId: string): NdaAgreement {
  const agreements = getNdaAgreements()
  const newAgreement: NdaAgreement = {
    userId,
    ideaId,
    agreedAt: new Date().toISOString()
  }
  agreements.push(newAgreement)
  setStorageItem(NDA_AGREEMENTS_KEY, agreements)
  
  // Create notification for idea owner
  const idea = getIdeaById(ideaId)
  if (idea && idea.postedBy !== userId) {
    createNotification({
      type: 'nda_signed',
      fromUserId: userId,
      fromUserName: userName,
      toUserId: idea.postedBy,
      ideaId: idea.id,
      ideaTitle: idea.title
    })
  }
  
  return newAgreement
}

// Join request functions
export function getJoinRequests(): JoinRequest[] {
  return getStorageItem<JoinRequest[]>(JOIN_REQUESTS_KEY, [])
}

export function getJoinRequestsForIdea(ideaId: string): JoinRequest[] {
  return getJoinRequests().filter(req => req.ideaId === ideaId)
}

export function createJoinRequest(ideaId: string, userId: string, userName: string, message: string): JoinRequest {
  const requests = getJoinRequests()
  const newRequest: JoinRequest = {
    id: generateId(),
    ideaId,
    userId,
    userName,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  requests.push(newRequest)
  setStorageItem(JOIN_REQUESTS_KEY, requests)
  
  // Create notification for idea owner
  const idea = getIdeaById(ideaId)
  if (idea) {
    createNotification({
      type: 'join_request',
      fromUserId: userId,
      fromUserName: userName,
      toUserId: idea.postedBy,
      ideaId: idea.id,
      ideaTitle: idea.title,
      message
    })
  }
  
  return newRequest
}

// Comment functions
export function getComments(): Comment[] {
  return getStorageItem<Comment[]>(COMMENTS_KEY, [])
}

export function getCommentsForIdea(ideaId: string): Comment[] {
  return getComments().filter(comment => comment.ideaId === ideaId)
}

export function createComment(ideaId: string, userId: string, userName: string, content: string): Comment {
  const comments = getComments()
  const newComment: Comment = {
    id: generateId(),
    ideaId,
    userId,
    userName,
    content,
    createdAt: new Date().toISOString()
  }
  comments.push(newComment)
  setStorageItem(COMMENTS_KEY, comments)
  return newComment
}

// Notification functions
export function getNotifications(): Notification[] {
  return getStorageItem<Notification[]>(NOTIFICATIONS_KEY, [])
}

export function getNotificationsForUser(userId: string): Notification[] {
  return getNotifications()
    .filter(n => n.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadNotificationCount(userId: string): number {
  return getNotifications().filter(n => n.toUserId === userId && !n.read).length
}

export function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const notifications = getNotifications()
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString()
  }
  notifications.push(newNotification)
  setStorageItem(NOTIFICATIONS_KEY, notifications)
  return newNotification
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const index = notifications.findIndex(n => n.id === notificationId)
  if (index !== -1) {
    notifications[index].read = true
    setStorageItem(NOTIFICATIONS_KEY, notifications)
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const notifications = getNotifications()
  const updated = notifications.map(n => 
    n.toUserId === userId ? { ...n, read: true } : n
  )
  setStorageItem(NOTIFICATIONS_KEY, updated)
}

// Profile view functions
export function getProfileViews(): ProfileView[] {
  return getStorageItem<ProfileView[]>(PROFILE_VIEWS_KEY, [])
}

export function logProfileView(viewerId: string, viewerName: string, viewedUserId: string): void {
  const views = getProfileViews()
  views.push({
    id: generateId(),
    viewerId,
    viewerName,
    viewedUserId,
    timestamp: new Date().toISOString()
  })
  setStorageItem(PROFILE_VIEWS_KEY, views)
  
  // Create notification for profile owner (if not viewing own profile)
  if (viewerId !== viewedUserId) {
    createNotification({
      type: 'profile_view',
      fromUserId: viewerId,
      fromUserName: viewerName,
      toUserId: viewedUserId
    })
  }
}

// Collaborator rating functions
export function getRatings(): CollaboratorRating[] {
  return getStorageItem<CollaboratorRating[]>(RATINGS_KEY, [])
}

export function getRatingsForUser(userId: string): CollaboratorRating[] {
  return getRatings().filter(r => r.toUserId === userId)
}

export function getRatingByUsers(fromUserId: string, toUserId: string): CollaboratorRating | undefined {
  return getRatings().find(r => r.fromUserId === fromUserId && r.toUserId === toUserId)
}

export function getCollaborators(userId: string): string[] {
  // Get all ideas where the user is a team member
  const ideas = getIdeas()
  const collaboratorIds = new Set<string>()
  
  ideas.forEach(idea => {
    if (idea.teamMembers.includes(userId)) {
      idea.teamMembers.forEach(memberId => {
        if (memberId !== userId) {
          collaboratorIds.add(memberId)
        }
      })
    }
  })
  
  return Array.from(collaboratorIds)
}

export function createRating(ratingData: Omit<CollaboratorRating, 'id' | 'createdAt'>): CollaboratorRating {
  const ratings = getRatings()
  
  // Check if already rated - if so, update
  const existingIndex = ratings.findIndex(r => 
    r.fromUserId === ratingData.fromUserId && r.toUserId === ratingData.toUserId
  )
  
  if (existingIndex !== -1) {
    ratings[existingIndex] = {
      ...ratings[existingIndex],
      ...ratingData,
      createdAt: new Date().toISOString()
    }
    setStorageItem(RATINGS_KEY, ratings)
    return ratings[existingIndex]
  }
  
  const newRating: CollaboratorRating = {
    ...ratingData,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  ratings.push(newRating)
  setStorageItem(RATINGS_KEY, ratings)
  
  // Update user's reputation
  const userRatings = getRatingsForUser(ratingData.toUserId)
  if (userRatings.length > 0) {
    const avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length
    updateUser(ratingData.toUserId, { reputation: avgRating })
  }
  
  return newRating
}

// Initialize with sample data
export function initializeSampleData(): void {
  if (typeof window === 'undefined') return
  
  // Check if already initialized
  if (getIdeas().length > 0) return
  
  // Create sample users
  const sampleUsers: User[] = [
    {
      id: 'user1',
      name: 'Alex Chen',
      email: 'alex@university.edu',
      password: 'password123',
      skills: ['AI/ML', 'Python', 'Data Science'],
      collegeEmail: 'alex@university.edu',
      linkedIn: 'linkedin.com/in/alexchen',
      isVerifiedStudent: true,
      isLinkedInVerified: true,
      reputation: 4.8,
      ideasPosted: ['idea1'],
      projectsJoined: ['idea1'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah@tech.com',
      password: 'password123',
      skills: ['Web Development', 'React', 'Node.js'],
      linkedIn: 'linkedin.com/in/sarahjohnson',
      isVerifiedStudent: false,
      isLinkedInVerified: true,
      reputation: 4.5,
      ideasPosted: ['idea2'],
      projectsJoined: ['idea2'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'user3',
      name: 'Mike Williams',
      email: 'mike@college.edu',
      password: 'password123',
      skills: ['IoT', 'Hardware', 'Embedded Systems'],
      collegeEmail: 'mike@college.edu',
      isVerifiedStudent: true,
      isLinkedInVerified: false,
      reputation: 4.2,
      ideasPosted: ['idea3'],
      projectsJoined: ['idea3'],
      createdAt: new Date().toISOString()
    }
  ]
  
  // Create sample ideas
  const sampleIdeas: Idea[] = [
    {
      id: 'idea1',
      title: 'AI-Powered Resume Optimizer',
      problemStatement: 'Job seekers struggle to tailor their resumes for ATS systems and specific job descriptions.',
      fullDescription: 'Build an AI tool that analyzes job descriptions and automatically suggests improvements to resumes. The system will use NLP to identify keywords, suggest better phrasing, and optimize formatting for Applicant Tracking Systems. Features include real-time scoring, industry-specific recommendations, and integration with major job boards.',
      skillsRequired: ['AI/ML', 'Python', 'Web Development', 'NLP'],
      contactEmail: 'alex@university.edu',
      postedBy: 'user1',
      postedByName: 'Alex Chen',
      teamMembers: ['user1'],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      timestamp: new Date(Date.now() - 86400000 * 5).toLocaleString()
    },
    {
      id: 'idea2',
      title: 'Local Business Discovery Platform',
      problemStatement: 'Small local businesses struggle to compete with large chains for online visibility.',
      fullDescription: 'Create a hyperlocal discovery app that helps users find and support small businesses in their neighborhood. Features include gamified loyalty rewards, community reviews, flash deals, and a "shop local" challenge system. The platform will partner with local chambers of commerce and business associations.',
      skillsRequired: ['Web Development', 'Mobile App', 'UI/UX', 'Marketing'],
      contactEmail: 'sarah@tech.com',
      postedBy: 'user2',
      postedByName: 'Sarah Johnson',
      teamMembers: ['user2'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      timestamp: new Date(Date.now() - 86400000 * 3).toLocaleString()
    },
    {
      id: 'idea3',
      title: 'Smart Plant Monitoring System',
      problemStatement: 'Urban gardeners and plant enthusiasts lack affordable tools to monitor plant health.',
      fullDescription: 'Develop an IoT-based plant monitoring system with soil moisture, light, and temperature sensors. The companion app provides care recommendations based on plant species, alerts for watering needs, and community features for sharing tips. Hardware will be open-source and affordable.',
      skillsRequired: ['IoT', 'Hardware', 'Mobile App', 'Cloud Backend'],
      contactEmail: 'mike@college.edu',
      postedBy: 'user3',
      postedByName: 'Mike Williams',
      teamMembers: ['user3'],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      timestamp: new Date(Date.now() - 86400000 * 1).toLocaleString()
    }
  ]
  
  setStorageItem(USERS_KEY, sampleUsers)
  setStorageItem(IDEAS_KEY, sampleIdeas)
}
