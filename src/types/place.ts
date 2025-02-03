export interface Place {
  id: string
  category: number
  name: string
  filter1:boolean
  filter2:boolean
  filter3:boolean
  filter4:boolean
  word:string
  time:string
  address:string
  phoneNumber:string
  likes:number
  liked: boolean
  pictures:string[]
  englishName?: string | null  
  tags?: string[];
}