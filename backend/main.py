from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GET ALL ---
@app.get("/exercises")
def get_exercises(db: Session = Depends(database.get_db)):
    return db.query(models.Exercise).all()

# --- CREATE ---
@app.post("/exercises", response_model=schemas.Exercise)
def create_exercise(item: schemas.ExerciseCreate, db: Session = Depends(database.get_db)):
    db_item = models.Exercise(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- UPDATE (Fixing the 500 Error here) ---
@app.put("/exercises/{exercise_id}", response_model=schemas.Exercise)
def update_exercise(exercise_id: str, item: schemas.ExerciseCreate, db: Session = Depends(database.get_db)):
    db_ex = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    # Manually update fields to ensure safety
    db_ex.name = item.name
    db_ex.description = item.description
    db_ex.intensity = item.intensity
    db_ex.setup = item.setup
    db_ex.variations = item.variations
    db_ex.coaching_points = item.coaching_points
    db_ex.goalkeepers = item.goalkeepers # This line matches schemas.py now
    db_ex.equipment = item.equipment
    db_ex.linked_basics = item.linked_basics
    db_ex.linked_principles = item.linked_principles
    db_ex.linked_tactics = item.linked_tactics
    
    db.commit()
    db.refresh(db_ex)
    return db_ex

# --- DELETE ---
@app.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: str, db: Session = Depends(database.get_db)):
    db_ex = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    db.delete(db_ex)
    db.commit()
    return {"message": "Deleted"}

# ==========================
#      BASICS LIBRARY
# ==========================
@app.get("/basics")
def get_basics(db: Session = Depends(database.get_db)):
    return db.query(models.Basic).all()

@app.post("/basics")
def create_basic(item: schemas.BasicCreate, db: Session = Depends(database.get_db)):
    db_item = models.Basic(
        name=item.name, 
        description=item.description,
        diagram_url=item.diagram_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/basics/{id}")
def update_basic(id: str, item: schemas.BasicCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Basic).filter(models.Basic.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = item.name
    db_item.description = item.description
    db_item.diagram_url = item.diagram_url
    
    db.commit()
    db.refresh(db_item) # <--- THIS LINE ENSURES INSTANT UPDATES
    return db_item

@app.delete("/basics/{id}")
def delete_basic(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Basic).filter(models.Basic.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}


# ==========================
#    PRINCIPLES LIBRARY
# ==========================
@app.get("/principles")
def get_principles(db: Session = Depends(database.get_db)):
    return db.query(models.Principle).all()

@app.post("/principles")
def create_principle(item: schemas.PrincipleCreate, db: Session = Depends(database.get_db)):
    db_item = models.Principle(
        name=item.name, 
        game_phase=item.game_phase, 
        description=item.description,
        coaching_notes=item.coaching_notes,
        implementation_tips=item.implementation_tips,
        media_url=item.media_url # <-- Added
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/principles/{id}")
def update_principle(id: str, item: schemas.PrincipleCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Principle).filter(models.Principle.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    
    db_item.name = item.name
    db_item.game_phase = item.game_phase
    db_item.description = item.description
    db_item.coaching_notes = item.coaching_notes
    db_item.implementation_tips = item.implementation_tips
    db_item.media_url = item.media_url # <-- Added
    
    db.commit()
    db.refresh(db_item) # This ensures we get the updated object back
    return db_item

@app.delete("/principles/{id}")
def delete_principle(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Principle).filter(models.Principle.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}


# ==========================
#     TACTICS LIBRARY
# ==========================
@app.get("/tactics")
def get_tactics(db: Session = Depends(database.get_db)):
    return db.query(models.Tactic).all()

@app.post("/tactics")
def create_tactic(item: schemas.TacticCreate, db: Session = Depends(database.get_db)):
    db_item = models.Tactic(
        name=item.name, 
        formation=item.formation, 
        description=item.description,
        diagram_url=item.diagram_url,
        suggested_drills=item.suggested_drills
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# --- TACTICS UPDATE ---
@app.put("/tactics/{id}")
def update_tactic(id: str, item: schemas.TacticCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Tactic).filter(models.Tactic.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = item.name
    db_item.formation = item.formation
    db_item.description = item.description
    db_item.diagram_url = item.diagram_url
    db_item.suggested_drills = item.suggested_drills
    
    db.commit()
    db.refresh(db_item) # <--- THIS LINE ENSURES INSTANT UPDATES
    return db_item

@app.delete("/tactics/{id}")
def delete_tactic(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.Tactic).filter(models.Tactic.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}



# ==========================
#    TRAINING SESSIONS
# ==========================
@app.get("/training_sessions")
def get_sessions(db: Session = Depends(database.get_db)):
    return db.query(models.TrainingSession).all()

@app.post("/training_sessions")
def create_session(item: schemas.TrainingSessionCreate, db: Session = Depends(database.get_db)):
    # Convert string date to Python Date object if needed, or keep as string/date in model
    # For simplicity with SQLite, we rely on the Pydantic validation
    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()
    
    db_item = models.TrainingSession(
        date=date_obj,
        start_time=item.start_time,
        end_time=item.end_time,
        focus=item.focus,
        intensity=item.intensity,
        selected_players=item.selected_players,
        selected_exercises=item.selected_exercises
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/training_sessions/{id}")
def update_session(id: str, item: schemas.TrainingSessionCreate, db: Session = Depends(database.get_db)):
    db_item = db.query(models.TrainingSession).filter(models.TrainingSession.id == id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse date again
    import datetime
    date_obj = datetime.datetime.strptime(item.date, "%Y-%m-%d").date()

    db_item.date = date_obj
    db_item.start_time = item.start_time
    db_item.end_time = item.end_time
    db_item.focus = item.focus
    db_item.intensity = item.intensity
    db_item.selected_players = item.selected_players
    db_item.selected_exercises = item.selected_exercises
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/training_sessions/{id}")
def delete_session(id: str, db: Session = Depends(database.get_db)):
    db_item = db.query(models.TrainingSession).filter(models.TrainingSession.id == id).first()
    if not db_item: raise HTTPException(status_code=404)
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}

# ==========================
#    PLAYERS (Helper)
# ==========================
# We need this to populate the "Available Players" list in the Training Modal
@app.get("/players")
def get_players(db: Session = Depends(database.get_db)):
    return db.query(models.Player).all()

@app.post("/players")
def create_player(item: schemas.PlayerCreate, db: Session = Depends(database.get_db)):
    db_item = models.Player(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item