from sqlalchemy import Column, String, Integer, Text, Boolean, Date, Time, ForeignKey
from database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

# --- 1. AUTH & TEAMS ---
class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    formation = Column(String) 
    created_at = Column(Date, default=datetime.date.today)

class Player(Base):
    __tablename__ = "players"
    id = Column(String, primary_key=True, default=generate_uuid)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    name = Column(String)
    jersey_number = Column(Integer)
    position = Column(String) 
    status = Column(String)   
    age = Column(Integer)
    height = Column(Integer)
    weight = Column(Integer)
    preferred_foot = Column(String)

# --- 2. LIBRARIES ---
class Basic(Base):
    __tablename__ = "basics"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    description = Column(Text)
    diagram_url = Column(String, nullable=True) # Added

class Principle(Base):
    __tablename__ = "principles"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    game_phase = Column(String)
    description = Column(Text)
    coaching_notes = Column(Text, nullable=True)      # Added
    implementation_tips = Column(Text, nullable=True) # Added (stored as newline text)
    media_url = Column(String, nullable=True)  # <-- Added this field

class Tactic(Base):
    __tablename__ = "tactics"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    formation = Column(String)
    description = Column(Text)
    diagram_url = Column(String, nullable=True)       # Added
    suggested_drills = Column(Text, nullable=True)    # Added (stored as newline text)

# --- 3. EXERCISES ---
class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    intensity = Column(String)
    description = Column(Text)
    setup = Column(Text, nullable=True)
    variations = Column(Text, nullable=True)
    coaching_points = Column(Text, nullable=True)
    goalkeepers = Column(Integer, default=0) 
    equipment = Column(Text, nullable=True) 
    media_url = Column(String, nullable=True)
    linked_basics = Column(Text, nullable=True)
    linked_principles = Column(Text, nullable=True)
    linked_tactics = Column(Text, nullable=True)

class TrainingSession(Base):
    __tablename__ = "training_sessions"
    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(Date)
    start_time = Column(String) # Storing as string "09:00 AM" for simplicity
    end_time = Column(String)   # Storing as string "11:00 AM"
    focus = Column(String)
    intensity = Column(String)
    
    # Store IDs as JSON strings or comma-separated lists
    selected_players = Column(Text)   # e.g. "p1,p2,p3"
    selected_exercises = Column(Text) # e.g. "ex1,ex2,ex5"    