import {useNavigate} from "react-router-dom";
import logo from "../assets/examina-logo.png";
import styles from "../styles/Welcome.module.css";

export default function Welcome() {
	const navigate = useNavigate();

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<div className={styles.top}>
					<img src={logo} alt="Examina logo" className={styles.logo} />
					<h1 className={styles.title}>Welcome to Examina</h1>
					<p className={styles.subtitle}>
						Create an account to start making your assessment workflow simpler.
					</p>
				</div>

				<div className={styles.bottom}>
					<button className={styles.button} onClick={() => navigate("/register")}>
						Get Started
					</button>
					<p className={styles.footer}>
						Already have an account?{" "}
						<span className={styles.link} onClick={() => navigate("/login")}>
							Sign In
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
