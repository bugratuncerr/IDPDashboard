from pydantic import BaseModel
from typing import Optional

# ==========================
#      TEAM & PLAYERS
# ==========================
class TeamCreate(BaseModel):
    name: str
    formation: str

class Team(TeamCreate):
    id: str
    class Config:
        orm_mode = True

class PlayerCreate(BaseModel):
    name: str
    jersey_number: int
    position: str
    status: str
    age: int = 0
    height: int = 0
    weight: int = 0
    preferred_foot: str = "Right"
    team_id: Optional[str] = None

class Player(PlayerCreate):
    id: str
    class Config:
        orm_mode = True

# ==========================
#        LIBRARIES
# ==========================
class BasicCreate(BaseModel):
    name: str
    description: str
    diagram_url: Optional[str] = None

class Basic(BasicCreate):
    id: str
    class Config:
        orm_mode = True

class PrincipleCreate(BaseModel):
    name: str
    game_phase: str
    description: str
    coaching_notes: Optional[str] = ""
    implementation_tips: Optional[str] = ""
    media_url: Optional[str] = None

class Principle(PrincipleCreate):
    id: str
    class Config:
        orm_mode = True

class TacticCreate(BaseModel):
    name: str
    formation: str
    description: str
    diagram_url: Optional[str] = None
    suggested_drills: Optional[str] = ""

class Tactic(TacticCreate):
    id: str
    class Config:
        orm_mode = True

# ==========================
#        EXERCISES
# ==========================
class ExerciseCreate(BaseModel):
    name: str
    intensity: str
    description: str
    setup: Optional[str] = ""
    variations: Optional[str] = ""
    coaching_points: Optional[str] = ""
    goalkeepers: int = 0
    equipment: Optional[str] = "" 
    linked_basics: Optional[str] = ""
    linked_principles: Optional[str] = ""
    linked_tactics: Optional[str] = ""
    media_url: Optional[str] = None

class Exercise(ExerciseCreate):
    id: str
    class Config:
        orm_mode = True

# ==========================
#    TRAINING SESSIONS
# ==========================
class TrainingSessionCreate(BaseModel):
    date: str
    start_time: str
    end_time: str
    focus: str
    intensity: str
    selected_players: str   # stored as comma-separated string
    selected_exercises: str # stored as comma-separated string

class TrainingSession(TrainingSessionCreate):
    id: str
    class Config:
        orm_mode = True